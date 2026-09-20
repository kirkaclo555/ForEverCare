import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

let cachedWeather: any = null;
let lastWeatherFetchTime: number = 0;
const WEATHER_CACHE_TTL = 3600 * 1000; // 1 hour

export async function GET(request: Request) {
  try {
    // 1. Fetch data from DB (with lean projections, avoiding password hashes and unused columns)
    const appointments = await (prisma.appointment as any).findMany({
      where: { isArchived: false },
      select: {
        purpose: true,
        appointmentDate: true,
        pet: {
          select: {
            species: true,
            medicalHistory: true
          }
        }
      }
    });

    const telemedicine = await (prisma.telemedicine as any).findMany({
      select: {
        concern: true,
        diagnosis: true,
        prescription: true,
        consultationDate: true,
        pet: {
          select: {
            species: true
          }
        }
      }
    });

    const pets = await (prisma.pet as any).findMany({
      where: { isArchived: false },
      select: {
        id: true,
        petName: true,
        species: true,
        breed: true,
        gender: true,
        age: true,
        environment: true,
        activity: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        appointments: {
          select: { id: true, purpose: true, appointmentDate: true, status: true }
        },
        telemedicine: {
          select: { id: true, concern: true, diagnosis: true, consultationDate: true, status: true }
        },
        monitoring: {
          select: { id: true, symptoms: true, reportSummary: true, createdAt: true, status: true }
        }
      }
    });

    const monitoringReports = await (prisma.petMonitoring as any).findMany({
      select: {
        symptoms: true,
        reportSummary: true,
        adminFindings: true,
        detailsAnswer: true,
        createdAt: true,
        admitRecommended: true,
        admitAccepted: true,
        pet: {
          select: {
            species: true
          }
        }
      }
    });

    // 2. Fetch live environmental data from the internet (Open-Meteo weather API for Balingasag)
    const now = Date.now();
    let weatherData = {
      temperature: 28.5,
      humidity: 75,
      rain: 0,
      condition: 'Pleasant',
      envAlert: 'Routine seasonal guidelines apply.'
    };

    if (cachedWeather && (now - lastWeatherFetchTime < WEATHER_CACHE_TTL)) {
      weatherData = cachedWeather;
    } else {
      try {
        // Balingasag coordinates: Lat 8.74, Long 124.78
        const weatherRes = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=8.74&longitude=124.78&current=temperature_2m,relative_humidity_2m,precipitation,rain'
        );
        if (weatherRes.ok) {
          const json = await weatherRes.json();
          if (json && json.current) {
            const temp = json.current.temperature_2m;
            const hum = json.current.relative_humidity_2m;
            const rainVal = json.current.rain || json.current.precipitation || 0;
            
            let condition = 'Pleasant';
            let envAlert = 'Weather conditions are stable. Good time for regular outdoor pet walks and immunization visits.';
            
            if (temp > 31) {
              condition = 'Hot & Humid';
              envAlert = `Alert: High heat (${temp}°C) detected in Balingasag. Elevated danger of Heatstroke. Keep pets hydrated. Heat increases animal irritability, raising localized Rabies bite incident risks.`;
            } else if (rainVal > 0.5 || hum > 80) {
              condition = 'Wet & Rainy';
              envAlert = `Alert: Heavy rainfall or high moisture (${hum}% humidity) detected. Canine Parvovirus remains highly stable in wet soil. leptospirosis warning is active due to potential contaminated water puddles.`;
            } else if (temp < 24) {
              condition = 'Cool';
              envAlert = 'Cooler temperatures detected. Monitor senior pets for joint stiffness and ensure puppies have warm shelter.';
            }

            weatherData = {
              temperature: temp,
              humidity: hum,
              rain: rainVal,
              condition,
              envAlert
            };
            cachedWeather = weatherData;
            lastWeatherFetchTime = now;
          }
        }
      } catch (e) {
        console.warn('[Analytics Weather Fetch Warn]: Failed to fetch live weather data. Using seasonal fallback.', e);
        if (cachedWeather) {
          weatherData = cachedWeather; // fallback to expired cache if fetch fails
        }
      }
    }

    // 3. Setup standard months and keyword lists
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const currentMonthName = months[currentMonthIdx] || 'Jan';

    // Categories structure: separated into Diagnoses and General Services
    const categoriesList = [
      { id: 'parvo', name: 'Parvovirus', type: 'diagnosis', keywords: ['parvo', 'parvovirus', 'bloody stool', 'canine parvo'] },
      { id: 'rabies', name: 'Rabies', type: 'diagnosis', keywords: ['rabies', 'hydrophobia', 'bite', 'foaming'] },
      { id: 'parasites', name: 'Parasitic Infections', type: 'diagnosis', keywords: ['parasite', 'parasites', 'parasitic', 'ticks', 'fleas', 'heartworm', 'hookworm', 'roundworm', 'tapeworm', 'lice', 'worms'] },
      { id: 'kennelCough', name: 'Kennel Cough', type: 'diagnosis', keywords: ['kennel cough', 'bordetella', 'coughing dog', 'honking cough', 'cough'] },
      { id: 'obesity', name: 'Obesity', type: 'diagnosis', keywords: ['obesity', 'obese', 'overweight', 'fat', 'weight gain'] },
      { id: 'ckd', name: 'Chronic Kidney Disease (CKD)', type: 'diagnosis', keywords: ['ckd', 'chronic kidney disease', 'kidney failure', 'renal failure', 'renal disease', 'kidney disease'] },
      { id: 'admission', name: 'Admission', type: 'general', keywords: ['admission', 'admit', 'admitted', 'confinement', 'confine', 'confined', 'hospitalization', 'hospitalize', 'hospitalised'] },
      { id: 'treatment', name: 'Treatment', type: 'general', keywords: ['treatment', 'treat', 'therapy', 'cure', 'medication', 'prescribe', 'prescription', 'rehab', 'procedures', 'medical checkup'] },
      { id: 'vaccination', name: 'Vaccination', type: 'general', keywords: ['vaccination', 'vaccine', 'vaccines', 'immunization', 'shot', 'shots', 'booster', 'boosters', 'vax', 'vaxx'] }
    ];

    // Dietary hazard keyword matchers (keep it clean and dynamic)
    const foodKeywords = [
      { name: 'Pedigree (Dog Kibble)', match: ['pedigree', 'dog food kibble', 'generic kibble'] },
      { name: 'Whiskas (Cat Dry Food)', match: ['whiskas', 'cat food dry', 'whiska'] },
      { name: 'Purina Pet Chow', match: ['purina', 'alpo', 'friskies'] },
      { name: 'Chocolate & Sweets', match: ['chocolate', 'candy', 'sweets', 'sugar'] },
      { name: 'Table Scraps (Onions/Garlic)', match: ['scrap', 'onion', 'garlic', 'table food', 'bones'] },
    ];

    // Data structures for results
    const casesByCategory: Record<string, { name: string; type: string; total: number; dog: number; cat: number; clinic: number; env: number }> = {};
    categoriesList.forEach(c => {
      casesByCategory[c.name] = { name: c.name, type: c.type, total: 0, dog: 0, cat: 0, clinic: 0, env: 0 };
    });

    const monthlyTrends: Record<string, Record<string, { dog: number; cat: number; total: number }>> = {};
    categoriesList.forEach(c => {
      const innerRecord: Record<string, { dog: number; cat: number; total: number }> = {};
      months.forEach(m => {
        innerRecord[m] = { dog: 0, cat: 0, total: 0 };
      });
      monthlyTrends[c.name] = innerRecord;
    });

    const foodIncidents: Record<string, { count: number; symptoms: string[]; petTypes: string[] }> = {};
    foodKeywords.forEach(f => {
      foodIncidents[f.name] = { count: 0, symptoms: [], petTypes: [] };
    });

    // Helper to classify record text
    const analyzeRecord = (
      text: string,
      petSpecies: string | null,
      source: 'clinic' | 'env',
      date: Date,
      extraInfo?: { admitRecommended?: boolean; admitAccepted?: boolean }
    ) => {
      const lowerText = text.toLowerCase();
      const monthName = months[date.getMonth()];
      if (!monthName) return;

      const isDog = petSpecies?.toLowerCase() === 'dog' || lowerText.includes('dog') || lowerText.includes('puppy');
      const isCat = petSpecies?.toLowerCase() === 'cat' || lowerText.includes('cat') || lowerText.includes('kitten');
      const species = isDog ? 'dog' : isCat ? 'cat' : 'other';

      categoriesList.forEach(c => {
        let matches = false;
        if (c.id === 'admission') {
          const hasKeyword = c.keywords.some(kw => lowerText.includes(kw));
          const hasFlag = extraInfo?.admitRecommended || extraInfo?.admitAccepted;
          matches = hasKeyword || !!hasFlag;
        } else {
          matches = c.keywords.some(kw => lowerText.includes(kw));
        }

        if (matches) {
          const entry = casesByCategory[c.name];
          if (entry) {
            entry.total++;
            if (species === 'dog') entry.dog++;
            if (species === 'cat') entry.cat++;
            if (source === 'clinic') entry.clinic++;
            else entry.env++;
          }
          const mTrend = monthlyTrends[c.name]?.[monthName];
          if (mTrend) {
            mTrend.total++;
            if (species === 'dog') mTrend.dog++;
            if (species === 'cat') mTrend.cat++;
          }
        }
      });

      // Food safety analysis
      foodKeywords.forEach(f => {
        if (f.match.some(mWord => lowerText.includes(mWord))) {
          const hasToxicSymptom = ['vomit', 'diarrhea', 'loose', 'poison', 'sick', 'lethargic', 'stool', 'stomach'].some(sy => lowerText.includes(sy));
          const isGastro = ['gastro', 'gastroenteritis', 'vomiting', 'diarrhea'].some(kw => lowerText.includes(kw));
          
          if (hasToxicSymptom || isGastro) {
            const entry = foodIncidents[f.name];
            if (entry) {
              entry.count++;
              if (species === 'dog' && !entry.petTypes.includes('Dog')) {
                entry.petTypes.push('Dog');
              }
              if (species === 'cat' && !entry.petTypes.includes('Cat')) {
                entry.petTypes.push('Cat');
              }
              
              let foundSymptom = 'Gastric irritation';
              if (lowerText.includes('vomit')) foundSymptom = 'Vomiting';
              else if (lowerText.includes('diarrhea')) foundSymptom = 'Severe Diarrhea';
              else if (lowerText.includes('poison')) foundSymptom = 'Food Poisoning';
              else if (lowerText.includes('allergy') || lowerText.includes('itch')) foundSymptom = 'Allergic response';
              
              if (!entry.symptoms.includes(foundSymptom)) {
                entry.symptoms.push(foundSymptom);
              }
            }
          }
        }
      });
    };

    // 4. Process Clinic Appointments
    appointments.forEach((app: any) => {
      const text = `${app.purpose} ${app.pet?.medicalHistory || ''}`;
      analyzeRecord(text, app.pet?.species || null, 'clinic', new Date(app.appointmentDate));
    });

    // 5. Process Telemedicine
    telemedicine.forEach((tm: any) => {
      const text = `${tm.concern} ${tm.diagnosis || ''} ${tm.prescription || ''}`;
      analyzeRecord(text, tm.pet?.species || null, 'clinic', new Date(tm.consultationDate));
    });

    // 6. Process Pet Monitoring Triage Logs
    monitoringReports.forEach((rep: any) => {
      const text = `${rep.symptoms || ''} ${rep.reportSummary || ''} ${rep.adminFindings || ''} ${rep.detailsAnswer || ''}`;
      analyzeRecord(
        text,
        rep.pet?.species || null,
        'env',
        new Date(rep.createdAt),
        { admitRecommended: rep.admitRecommended, admitAccepted: rep.admitAccepted }
      );
    });

    // 7. No Supplement Seed Data (stays empty if there is no database entries)

    // 8. Generate Vaccine recommendations based on outbreaks & weather
    let vaccineAlert = {
      active: false,
      disease: '',
      urgency: 'Normal',
      message: 'Keep routine vaccination protocols active. No major seasonal spikes detected.',
      targetSpecies: 'All Pets'
    };

    if (weatherData.condition === 'Hot & Humid') {
      vaccineAlert = {
        active: true,
        disease: 'Rabies & Hydration Drive',
        urgency: 'LIVE HEAT ALERT',
        message: weatherData.envAlert,
        targetSpecies: 'Dogs & Cats'
      };
    } else if (weatherData.condition === 'Wet & Rainy') {
      vaccineAlert = {
        active: true,
        disease: 'Leptospirosis & Parvovirus Drive',
        urgency: 'LIVE WET ALERT',
        message: weatherData.envAlert,
        targetSpecies: 'Dogs (Puppies)'
      };
    } else {
      const isSummer = ['Mar', 'Apr', 'May'].includes(currentMonthName);
      const isWetSeason = ['Jun', 'Jul', 'Aug'].includes(currentMonthName);

      if (isSummer) {
        vaccineAlert = {
          active: true,
          disease: 'Rabies & Heatstroke',
          urgency: 'HIGH ALERT',
          message: 'Aggressive rabies vaccinations and outdoor hydration alerts are highly recommended. High-heat months statistically prompt extreme rabies transmission risks in dogs.',
          targetSpecies: 'Dogs & Cats'
        };
      } else if (isWetSeason) {
        vaccineAlert = {
          active: true,
          disease: 'Canine Parvovirus (CPV)',
          urgency: 'CRITICAL WARNING',
          message: 'Wet, cold conditions foster high Parvovirus stability. Target puppies and unvaccinated dogs immediately for vaccine administration.',
          targetSpecies: 'Dogs (Puppies)'
        };
      } else {
        const rabiesTotal = casesByCategory['Rabies']?.total || 0;
        const parvoTotal = casesByCategory['Parvovirus']?.total || 0;
        if (rabiesTotal > parvoTotal && rabiesTotal > 0) {
          vaccineAlert = {
            active: true,
            disease: 'Anti-Rabies Drive',
            urgency: 'RECOMMENDED',
            message: 'Historical rabies counts are elevated. Advising scheduling of community anti-rabies vaccine drives to secure localized immunity.',
            targetSpecies: 'Dogs & Cats'
          };
        } else if (parvoTotal > 5) {
          vaccineAlert = {
            active: true,
            disease: 'Parvovirus Booster Drive',
            urgency: 'RECOMMENDED',
            message: 'Parvo cases have risen this month. Schedule standard DHLPP vaccination clinics for local dogs.',
            targetSpecies: 'Dogs'
          };
        }
      }
    }

    // 9. Compute Demographics & Pet Activity Records
    const demographics = {
      sex: { Male: 0, Female: 0, Unknown: 0 },
      ageGroup: { 'Puppy / Kitten (0-1 yrs)': 0, 'Adult (2-6 yrs)': 0, 'Senior (7+ yrs)': 0, 'Unspecified': 0 },
      environment: { Indoor: 0, Outdoor: 0, Mixed: 0 },
      activity: { Low: 0, Moderate: 0, High: 0 }
    };

    const ownerMap: Record<string, { ownerName: string; email: string; petCount: number }> = {};

    const petActivityRecords = pets.map((p: any) => {
      // Sex breakdown
      const gender = (p.gender || 'Unknown').trim();
      if (gender.toLowerCase().includes('male') && !gender.toLowerCase().includes('fe')) demographics.sex.Male++;
      else if (gender.toLowerCase().includes('female')) demographics.sex.Female++;
      else demographics.sex.Unknown++;

      // Age breakdown
      const ageVal = p.age ?? null;
      if (ageVal === null) {
        demographics.ageGroup['Unspecified']++;
      } else if (ageVal <= 1) {
        demographics.ageGroup['Puppy / Kitten (0-1 yrs)']++;
      } else if (ageVal <= 6) {
        demographics.ageGroup['Adult (2-6 yrs)']++;
      } else {
        demographics.ageGroup['Senior (7+ yrs)']++;
      }

      // Environment breakdown
      const env = p.environment || 'Indoor';
      if (env === 'Outdoor') demographics.environment.Outdoor++;
      else if (env === 'Mixed') demographics.environment.Mixed++;
      else demographics.environment.Indoor++;

      // Activity breakdown
      const act = p.activity || 'Moderate';
      if (act === 'Low') demographics.activity.Low++;
      else if (act === 'High') demographics.activity.High++;
      else demographics.activity.Moderate++;

      // Owner identity tracking
      const ownerId = p.user?.id || 'Unknown';
      const ownerName = p.user?.fullName || 'Unknown Owner';
      const ownerEmail = p.user?.email || 'No Email';
      if (!ownerMap[ownerId]) {
        ownerMap[ownerId] = { ownerName, email: ownerEmail, petCount: 0 };
      }
      ownerMap[ownerId].petCount++;

      // Total activity count (clinic appointments + telemedicine + triage monitoring)
      const appointmentCount = p.appointments?.length || 0;
      const teleCount = p.telemedicine?.length || 0;
      const monitorCount = p.monitoring?.length || 0;
      const totalActivities = appointmentCount + teleCount + monitorCount;

      return {
        id: p.id,
        petName: p.petName,
        species: p.species || 'Unknown',
        breed: p.breed || 'Unknown',
        gender: p.gender || 'Unknown',
        age: p.age ? `${p.age} yrs` : 'Unknown',
        environment: env,
        activity: act,
        ownerId,
        ownerName,
        ownerEmail,
        appointmentCount,
        teleCount,
        monitorCount,
        totalActivities,
        recentActivity: p.monitoring[0]?.reportSummary || p.telemedicine[0]?.concern || p.appointments[0]?.purpose || 'No recent activity'
      };
    });

    // Format output data
    const allFormattedCases = Object.values(casesByCategory);
    const diagnoses = allFormattedCases.filter(c => c.type === 'diagnosis');
    const generalServices = allFormattedCases.filter(c => c.type === 'general');

    const formattedDietaryWarnings = Object.entries(foodIncidents)
      .filter(([_, data]) => data.count > 0)
      .map(([foodName, data]) => ({
        foodName,
        count: data.count,
        symptoms: data.symptoms,
        petTypes: data.petTypes
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      currentMonth: currentMonthName,
      weather: weatherData,
      vaccineAlert,
      diagnoses,
      generalServices,
      monthlyTrends,
      dietaryWarnings: formattedDietaryWarnings,
      demographics,
      ownerMetrics: {
        totalOwners: Object.keys(ownerMap).length,
        owners: Object.values(ownerMap)
      },
      petActivityRecords
    });

  } catch (error) {
    console.error('[Analytics API Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to aggregate analytics data' }, { status: 500 });
  }
}
