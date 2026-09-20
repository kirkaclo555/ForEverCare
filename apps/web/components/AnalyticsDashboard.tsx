"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './analytics.css';

interface CategoryRecord {
  name: string;
  type: string;
  total: number;
  dog: number;
  cat: number;
  clinic: number;
  env: number;
}

interface MonthlyTrendDetail {
  dog: number;
  cat: number;
  total: number;
}

interface MonthlyCategoryTrends {
  [categoryName: string]: {
    [monthName: string]: MonthlyTrendDetail;
  };
}

interface DietaryWarning {
  foodName: string;
  count: number;
  symptoms: string[];
  petTypes: string[];
}

interface VaccineAlert {
  active: boolean;
  disease: string;
  urgency: string;
  message: string;
  targetSpecies: string;
}

export default function AnalyticsDashboard() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Parvovirus');

  // Analytics API Data States
  const [diagnoses, setDiagnoses] = useState<CategoryRecord[]>([]);
  const [generalServices, setGeneralServices] = useState<CategoryRecord[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyCategoryTrends>({});
  const [dietaryWarnings, setDietaryWarnings] = useState<DietaryWarning[]>([]);
  const [vaccineAlert, setVaccineAlert] = useState<VaccineAlert>({
    active: false,
    disease: '',
    urgency: 'Normal',
    message: '',
    targetSpecies: ''
  });
  const [weather, setWeather] = useState<{
    temperature: number;
    humidity: number;
    rain: number;
    condition: string;
    envAlert: string;
  } | null>(null);

  const [demographics, setDemographics] = useState<any>({
    sex: { Male: 0, Female: 0, Unknown: 0 },
    ageGroup: { 'Puppy / Kitten (0-1 yrs)': 0, 'Adult (2-6 yrs)': 0, 'Senior (7+ yrs)': 0, 'Unspecified': 0 },
    environment: { Indoor: 0, Outdoor: 0, Mixed: 0 },
    activity: { Low: 0, Moderate: 0, High: 0 }
  });
  const [ownerMetrics, setOwnerMetrics] = useState<any>({ totalOwners: 0, owners: [] });
  const [petActivityRecords, setPetActivityRecords] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setDiagnoses(data.diagnoses || []);
        setGeneralServices(data.generalServices || []);
        setMonthlyTrends(data.monthlyTrends || {});
        setDietaryWarnings(data.dietaryWarnings || []);
        setVaccineAlert(data.vaccineAlert || {
          active: false,
          disease: '',
          urgency: 'Normal',
          message: '',
          targetSpecies: ''
        });
        setWeather(data.weather || null);
        if (data.demographics) setDemographics(data.demographics);
        if (data.ownerMetrics) setOwnerMetrics(data.ownerMetrics);
        if (data.petActivityRecords) setPetActivityRecords(data.petActivityRecords);
      }
    } catch (err) {
      console.error('Failed to load analytics aggregation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const diagnosesList = [
    'Parvovirus',
    'Rabies',
    'Parasitic Infections',
    'Kennel Cough',
    'Obesity',
    'Chronic Kidney Disease (CKD)'
  ];

  const generalServicesList = [
    'Admission',
    'Treatment',
    'Vaccination'
  ];

  // Filtering for table matrix
  const filteredDiagnosesList = diagnosesList.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGeneralServicesList = generalServicesList.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Prepare selected category trends
  const chartData = months.map(m => {
    const trend = monthlyTrends[selectedCategory]?.[m] || { dog: 0, cat: 0, total: 0 };
    return {
      month: m,
      dog: trend.dog,
      cat: trend.cat,
      total: trend.total
    };
  });

  // Compute maximum cases to scale pure SVG charts
  const maxMonthlyCases = Math.max(...chartData.map(d => Math.max(d.dog, d.cat, d.total, 1)), 1);

  // SVG Chart Dimensions
  const chartWidth = 700;
  const chartHeight = 250;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  // Combine categories for shares calculations
  const allCategories = [...diagnoses, ...generalServices];
  const totalAllCases = allCategories.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="analytics-container">
      
      {/* Live Environmental Tracker Panel */}
      {!loading && weather && (
        <div className="weather-tracker-panel" style={{
          background: 'linear-gradient(135deg, #1A365D, #2A4365)',
          color: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '280px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <i className={weather.condition.includes('Rain') ? "fas fa-cloud-showers-heavy" : "fas fa-sun"} style={{ color: '#FBD38D' }}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                {language === 'tl' ? 'Live na Panahon at Alagang Hayop Feed' : 'Live Environmental Pet Feed (Balingasag)'}
                <span style={{ fontSize: '0.75rem', background: '#319795', padding: '2px 8px', borderRadius: '12px', color: 'white', fontWeight: 600 }}>Live Feed</span>
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.4' }}>
                {weather.envAlert}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', color: '#a0aec0', fontWeight: 600 }}>{language === 'tl' ? 'Temperatura' : 'Temp'}</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{weather.temperature}°C</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', color: '#a0aec0', fontWeight: 600 }}>{language === 'tl' ? 'Halumigmig' : 'Humidity'}</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{weather.humidity}%</span>
            </div>
            {weather.rain > 0 && (
              <>
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', color: '#a0aec0', fontWeight: 600 }}>{language === 'tl' ? 'Ulan' : 'Rain'}</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{weather.rain}mm</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Alert Banner / Vaccine Timing recommendation */}
      {!loading && vaccineAlert.active && (
        <div className={`alert-banner ${vaccineAlert.urgency.includes('CRITICAL') || vaccineAlert.urgency.includes('HIGH') ? 'critical' : 'warning'}`}>
          <div className="alert-icon-wrapper">
            <i className="fas fa-syringe"></i>
          </div>
          <div className="alert-info">
            <h3>
              [{vaccineAlert.urgency}] Seasonal Outbreak Alert: {vaccineAlert.disease}
            </h3>
            <p>
              {vaccineAlert.message} <strong>Target Population: {vaccineAlert.targetSpecies}.</strong>
            </p>
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="analytics-grid">
        
        {/* Monthly Trend - Pure High-Performance SVG Graph */}
        <div className="analytics-card">
          <div className="card-header-clean">
            <h2>
              <i className="fas fa-chart-line" style={{ color: '#2E5E3E' }}></i>
              {language === 'tl' ? `Trend ng Kaso: ${selectedCategory}` : `Case Trend: ${selectedCategory}`}
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>{language === 'tl' ? 'Pumili:' : 'Select Metric:'}</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  backgroundColor: '#fff',
                  color: '#2d3748',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <optgroup label={language === 'tl' ? 'Mga Diagnosis' : 'Diagnoses'}>
                  {diagnosesList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </optgroup>
                <optgroup label={language === 'tl' ? 'Pangkalahatang Serbisyo' : 'General Services'}>
                  {generalServicesList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="chart-container-svg" style={{ flexDirection: 'column', color: '#718096' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>Calculating trends...</p>
            </div>
          ) : totalAllCases === 0 ? (
            <div className="chart-container-svg" style={{ flexDirection: 'column', color: '#a0aec0', background: '#f7fafc', borderRadius: '16px' }}>
              <i className="fas fa-chart-bar" style={{ fontSize: '2.5rem', marginBottom: '10px', opacity: 0.4 }}></i>
              <p style={{ fontWeight: 600 }}>{language === 'tl' ? 'Walang Datos na Naka-log' : 'No Case Data Logged Yet'}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '4px 0 0 0' }}>{language === 'tl' ? 'Magsisimula ang graph kapag may pumasok na mga rekord.' : 'Graph will populate once records enter the database.'}</p>
            </div>
          ) : (
            <div>
              <div className="chart-container-svg">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = paddingY + graphHeight * (1 - ratio);
                    const value = Math.round(maxMonthlyCases * ratio);
                    return (
                      <g key={index}>
                        <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} className="grid-line" />
                        <text x={paddingX - 10} y={y + 4} className="axis-text" textAnchor="end">{value}</text>
                      </g>
                    );
                  })}

                  {/* Monthly Bars */}
                  {chartData.map((trend, idx) => {
                    const barWidth = 14;
                    const spacing = graphWidth / chartData.length;
                    const xCenter = paddingX + spacing * idx + spacing / 2;

                    // Dog Bar
                    const dogHeight = (trend.dog / maxMonthlyCases) * graphHeight;
                    const dogY = paddingY + graphHeight - dogHeight;
                    const dogX = xCenter - barWidth - 2;

                    // Cat Bar
                    const catHeight = (trend.cat / maxMonthlyCases) * graphHeight;
                    const catY = paddingY + graphHeight - catHeight;
                    const catX = xCenter + 2;

                    return (
                      <g key={idx}>
                        {/* Dog Bar */}
                        <rect
                          x={dogX}
                          y={dogY}
                          width={barWidth}
                          height={Math.max(dogHeight, 2)}
                          rx="4"
                          className="bar-dog"
                        >
                          <title>{`Dogs: ${trend.dog} cases`}</title>
                        </rect>
                        {/* Cat Bar */}
                        <rect
                          x={catX}
                          y={catY}
                          width={barWidth}
                          height={Math.max(catHeight, 2)}
                          rx="4"
                          className="bar-cat"
                        >
                          <title>{`Cats: ${trend.cat} cases`}</title>
                        </rect>
                        {/* Month Axis Labels */}
                        <text
                          x={xCenter}
                          y={chartHeight - 8}
                          className="axis-text"
                          textAnchor="middle"
                        >
                          {trend.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart Legends */}
              <div className="legend-container">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#2E5E3E' }}></div>
                  <span>{language === 'tl' ? 'Mga Aso (Dogs)' : 'Dogs'}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#E9D8FD' }}></div>
                  <span>{language === 'tl' ? 'Mga Pusa (Cats)' : 'Cats'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Diagnosis Distribution Case Shares */}
        <div className="analytics-card">
          <div className="card-header-clean">
            <h2>
              <i className="fas fa-percentage" style={{ color: '#2E5E3E' }}></i>
              {language === 'tl' ? 'Pamamahagi ng mga Kaso' : 'Overall Case Shares'}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: '#718096' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '10px' }}></i>
              <p>Analyzing shares...</p>
            </div>
          ) : totalAllCases === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: '#a0aec0', textAlign: 'center', padding: '10px' }}>
              <i className="fas fa-chart-pie" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.4 }}></i>
              <p style={{ fontSize: '0.85rem' }}>{language === 'tl' ? 'Walang kumpirmadong mga kaso sa system.' : 'No case distributions to calculate yet.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              {allCategories
                .filter(c => c.total > 0)
                .slice(0, 4)
                .map((cat, idx) => {
                  const percentage = Math.round((cat.total / totalAllCases) * 100);
                  const colors = ['#2E5E3E', '#3182ce', '#dd6b20', '#805ad5'];
                  const fillColor = colors[idx] || '#2E5E3E';

                  return (
                    <div className="dist-item" key={idx}>
                      <div className="dist-meta">
                        <span className="dist-name">{cat.name}</span>
                        <span className="dist-percentage" style={{ color: fillColor }}>{percentage}%</span>
                      </div>
                      <div className="dist-bar-bg">
                        <div
                          className="dist-bar-fill"
                          style={{ width: `${percentage}%`, background: fillColor }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              {allCategories.filter(c => c.total > 0).length === 0 && (
                <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>All active cases are at 0.</p>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Dietary & Food Warnings Section */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2d3748', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fas fa-exclamation-triangle" style={{ color: '#e53e3e' }}></i>
        {language === 'tl' ? 'Babala sa Pagkain ng Alaga (Gastrointestinal & Toxins)' : 'Dietary Safety Warnings (GI Irritation & Toxicity Tracker)'}
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '10px' }}></i>
          <p>Processing dietary alerts...</p>
        </div>
      ) : dietaryWarnings.length === 0 ? (
        <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '16px', textAlign: 'center', color: '#a0aec0', marginBottom: '25px' }}>
          <i className="fas fa-shield-alt" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
          <p>No pet food anomalies or toxicity cases flagged in the local area this month.</p>
        </div>
      ) : (
        <div className="food-warnings-grid">
          {dietaryWarnings.map((warn, index) => (
            <div className="food-warning-card" key={index}>
              <div className="food-header">
                <h4 className="food-title">{warn.foodName}</h4>
                <span className="food-badge">{warn.count} {language === 'tl' ? 'kaso' : 'cases'}</span>
              </div>
              <p>
                Linked directly to acute gastric incidents in local <strong>{warn.petTypes.join(' & ')}s</strong> this month. Recommend warning local buyers.
              </p>
              <div className="symptoms-tags">
                {warn.symptoms.map((sym, sIdx) => (
                  <span className="symptom-tag" key={sIdx}>
                    <i className="fas fa-skull-crossbones" style={{ color: '#e53e3e', marginRight: '4px' }}></i>
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sickness Details Table Section */}
      <div className="table-container" style={{ marginTop: '25px' }}>
        <div className="card-header-clean" style={{ border: 'none', padding: 0 }}>
          <div>
            <h2>
              <i className="fas fa-clipboard-list" style={{ color: '#2E5E3E' }}></i>
              {language === 'tl' ? 'Buwanang Matrix ng Karamdaman at Serbisyo' : 'Monthly Cases & Services Matrix'}
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#718096' }}>
              {language === 'tl' 
                ? 'Bilang ng mga kaso bawat buwan para sa mga pangunahing diagnosis at pangkalahatang serbisyong medikal.' 
                : 'Number of cases per month across medical diagnoses and general clinical operations.'}
            </p>
          </div>
          <div className="search-wrapper" style={{ marginBottom: 0 }}>
            <i className="fas fa-search" style={{ color: '#a0aec0' }}></i>
            <input
              type="text"
              placeholder={language === 'tl' ? 'Maghanap ng kategorya...' : 'Search category...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%', marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.8rem', color: '#718096', fontWeight: 700 }}>
                  {language === 'tl' ? 'Kategorya / Diagnosis' : 'Category / Diagnosis'}
                </th>
                {months.map(m => (
                  <th key={m} style={{ padding: '12px 10px', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.8rem', color: '#718096', fontWeight: 700 }}>
                    {m}
                  </th>
                ))}
                <th style={{ padding: '15px', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.8rem', color: '#718096', fontWeight: 700 }}>
                  {language === 'tl' ? 'Kabuuan' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '5px' }}></i> Loading cases matrix...
                  </td>
                </tr>
              ) : filteredDiagnosesList.length === 0 && filteredGeneralServicesList.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                    No categories matching that search term.
                  </td>
                </tr>
              ) : (
                <>
                  {/* Diagnoses Section Header */}
                  {filteredDiagnosesList.length > 0 && (
                    <tr style={{ backgroundColor: '#f7fafc' }}>
                      <td colSpan={14} style={{ padding: '10px 15px', fontWeight: 700, fontSize: '0.85rem', color: '#2b6cb0', textTransform: 'uppercase' }}>
                        {language === 'tl' ? 'Mga Diagnosis (Pang-medikal)' : 'Diagnoses (Medical Conditions)'}
                      </td>
                    </tr>
                  )}
                  {/* Diagnoses Rows */}
                  {filteredDiagnosesList.map((catName) => {
                    const rowTotal = diagnoses.find(d => d.name === catName)?.total || 0;
                    return (
                      <tr key={catName} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '12px 15px', fontWeight: 600, color: '#2d3748' }}>{catName}</td>
                        {months.map(m => {
                          const val = monthlyTrends[catName]?.[m]?.total || 0;
                          return (
                            <td key={m} style={{ padding: '12px 10px', textAlign: 'center', color: val > 0 ? '#2E5E3E' : '#cbd5e0', fontWeight: val > 0 ? 700 : 400 }}>
                              {val}
                            </td>
                          );
                        })}
                        <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 700, color: rowTotal > 0 ? '#2E5E3E' : '#718096' }}>
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}

                  {/* General Services Section Header */}
                  {filteredGeneralServicesList.length > 0 && (
                    <tr style={{ backgroundColor: '#f7fafc' }}>
                      <td colSpan={14} style={{ padding: '10px 15px', fontWeight: 700, fontSize: '0.85rem', color: '#2b6cb0', textTransform: 'uppercase' }}>
                        {language === 'tl' ? 'Pangkalahatang Serbisyo at Aksyon' : 'General Services & Operations'}
                      </td>
                    </tr>
                  )}
                  {/* General Services Rows */}
                  {filteredGeneralServicesList.map((catName) => {
                    const rowTotal = generalServices.find(g => g.name === catName)?.total || 0;
                    return (
                      <tr key={catName} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '12px 15px', fontWeight: 600, color: '#2d3748' }}>{catName}</td>
                        {months.map(m => {
                          const val = monthlyTrends[catName]?.[m]?.total || 0;
                          return (
                            <td key={m} style={{ padding: '12px 10px', textAlign: 'center', color: val > 0 ? '#3182ce' : '#cbd5e0', fontWeight: val > 0 ? 700 : 400 }}>
                              {val}
                            </td>
                          );
                        })}
                        <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 700, color: rowTotal > 0 ? '#3182ce' : '#718096' }}>
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Demographics Analytics Section (Sex, Age, Environment, Activity) --- */}
      <div style={{ marginTop: '40px', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-chart-pie" style={{ color: '#2E5E3E' }}></i>
          {language === 'tl' ? 'Demograpikong Pagsusuri ng mga Alaga' : 'Pet Demographic Analytics'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Sex Distribution */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-venus-mars" style={{ color: '#ec4899' }}></i> Sex Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(demographics.sex || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>{key}</span>
                  <span style={{ fontWeight: 700, color: '#2E5E3E', fontSize: '0.95rem' }}>{val as number} pets</span>
                </div>
              ))}
            </div>
          </div>

          {/* Age Groups */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-birthday-cake" style={{ color: '#f59e0b' }}></i> Age Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(demographics.ageGroup || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.85rem' }}>{key}</span>
                  <span style={{ fontWeight: 700, color: '#2E5E3E', fontSize: '0.95rem' }}>{val as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Living Environment */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-home" style={{ color: '#10b981' }}></i> Environment Mode
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(demographics.environment || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>{key}</span>
                  <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>{val as number} pets</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Levels */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-running" style={{ color: '#3b82f6' }}></i> Daily Activity
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(demographics.activity || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>{key}</span>
                  <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.95rem' }}>{val as number} pets</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Pet Record Activity & Owner Identification Table --- */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-clipboard-list" style={{ color: '#2E5E3E' }}></i>
              {language === 'tl' ? 'Log ng Aktibidad at Pagkakakilanlan ng Alaga' : 'Pet Activity & Identity Activity Log'}
            </h3>
            <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Comprehensive patient tracking linked to owner identity (clinic & app registered pets)
            </p>
          </div>
          <div style={{ background: '#eaf3de', color: '#2E5E3E', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>
            Total Owners: {ownerMetrics.totalOwners}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #edf2f7' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#4a5568' }}>Pet Name & Breed</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#4a5568' }}>Owner Identity</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#4a5568' }}>Sex & Age</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#4a5568' }}>Environment & Activity</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', color: '#4a5568' }}>Recorded Activities</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#4a5568' }}>Recent Activity Note</th>
              </tr>
            </thead>
            <tbody>
              {petActivityRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#a0aec0' }}>
                    No pet activity records found.
                  </td>
                </tr>
              ) : (
                petActivityRecords.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '14px 15px' }}>
                      <div style={{ fontWeight: 700, color: '#2d3748' }}>{p.petName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>{p.species} • {p.breed}</div>
                    </td>
                    <td style={{ padding: '14px 15px' }}>
                      <div style={{ fontWeight: 600, color: '#2b6cb0' }}>{p.ownerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{p.ownerEmail}</div>
                    </td>
                    <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                      <span style={{ background: '#f7fafc', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>
                        {p.gender} • {p.age}
                      </span>
                    </td>
                    <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d3748' }}>{p.environment}</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>{p.activity} Activity</div>
                    </td>
                    <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                      <span style={{ background: p.totalActivities > 0 ? '#c6f6d5' : '#edf2f7', color: p.totalActivities > 0 ? '#22543d' : '#718096', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                        {p.totalActivities} Total
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '4px' }}>
                        {p.appointmentCount} Clinic | {p.teleCount} Tele | {p.monitorCount} Triage
                      </div>
                    </td>
                    <td style={{ padding: '14px 15px', color: '#4a5568', fontSize: '0.85rem', maxWidth: '240px' }}>
                      {p.recentActivity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
