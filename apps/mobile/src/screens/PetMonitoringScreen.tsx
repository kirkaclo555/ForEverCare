import React, { useState, useEffect } from 'react';
import { usePetContext } from '../context/PetContext';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Users: undefined;
  Appointments: undefined;
  Pets: undefined;
};

type PetsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pets'>;

type Props = {
  navigation: PetsScreenNavigationProp;
};

export default function PetsScreen({ navigation }: Props) {
  const { pets } = usePetContext();
  // Wizard States
  const [step, setStep] = useState(1);
  const [selectedPet, setSelectedPet] = useState(pets.length > 0 ? pets[0].name : '');
  const [category, setCategory] = useState('');
  const [guideQuestion, setGuideQuestion] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [duration, setDuration] = useState('');
  const [happenedBefore, setHappenedBefore] = useState('');
  const [onMedication, setOnMedication] = useState('');
  
  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [severity, setSeverity] = useState<'mild' | 'worst' | ''>(''); 
  
  // Monitoring States
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringComplete, setMonitoringComplete] = useState(false);
  const [didWorsen, setDidWorsen] = useState<boolean | null>(null);

  const performAnalysis = () => {
    setIsAnalyzing(true);
    setStep(5); // The Analyzing loading step
    
    setTimeout(() => {
      setIsAnalyzing(false);
      // Mock logic: If symptom contains 'blood' or duration is '> 3 days', make it 'worst'
      const isWorstCase = 
          symptomsText.toLowerCase().includes('blood') || 
          symptomsText.toLowerCase().includes('seizure') ||
          duration === '> 3 days';
      
      setSeverity(isWorstCase ? 'worst' : 'mild');
      setStep(6);
    }, 2500); // 2.5s analysis delay
  };

  const handleSendToClinic = (type: string) => {
    Alert.alert(
      "Sent to Clinic", 
      `Your ${type} has been successfully sent to FurEver Paw Care. Our team will review it shortly.`,
      [{ text: "OK", onPress: () => resetWizard() }]
    );
  };

  const resetWizard = () => {
    setStep(1);
    setCategory('');
    setGuideQuestion('');
    setSymptomsText('');
    setDuration('');
    setHappenedBefore('');
    setOnMedication('');
    setSeverity('');
    setIsMonitoring(false);
    setMonitoringComplete(false);
    setDidWorsen(null);
  };

  // UI Render Helpers

  const renderStep1 = () => (
    <View style={styles.wizardContainer}>
      <Text style={styles.wizardTitle}>Pet Triage & Monitoring</Text>
      <Text style={styles.wizardSubtitle}>What are you monitoring today?</Text>
      
      <Text style={styles.inputLabel}>Select Pet</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSelectorRow}>
         {pets.length > 0 ? (
           pets.map(pet => (
             <TouchableOpacity 
               key={pet.id}
               style={[styles.petSelectorBtn, { flex: 0, paddingHorizontal: 20 }, selectedPet === pet.name && styles.petSelectorActive]}
               onPress={() => setSelectedPet(pet.name)}
             >
               <FontAwesome5 name={pet.avatar || (pet.species.toLowerCase() === 'cat' ? 'cat' : 'dog')} size={16} color={selectedPet === pet.name ? 'white' : '#4a5568'} />
               <Text style={[styles.petSelectorText, selectedPet === pet.name && styles.petSelectorTextActive]}>{pet.name}</Text>
             </TouchableOpacity>
           ))
         ) : (
           <Text style={{ color: '#718096', fontStyle: 'italic', paddingVertical: 10 }}>No pets available. Please add a pet in Pet Records.</Text>
         )}
      </ScrollView>

      <Text style={styles.inputLabel}>Category</Text>
      {['Health', 'Activity', 'Behavior'].map((cat) => (
         <TouchableOpacity 
           key={cat}
           style={[styles.optionCard, category === cat && styles.optionCardActive]}
           onPress={() => setCategory(cat)}
         >
           <Text style={[styles.optionCardText, category === cat && styles.optionCardTextActive]}>{cat}</Text>
           {category === cat && <FontAwesome5 name="check-circle" size={18} color="#2E5E3E" />}
         </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={[styles.primaryButton, !category && styles.buttonDisabled]} 
        disabled={!category}
        onPress={() => setStep(2)}
      >
        <Text style={styles.primaryButtonText}>Next Step</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => {
    const commonGuides = 
      category === 'Health' ? ["Is your pet vomiting?", "Unusual bowel movements?", "Lack of appetite?"] :
      category === 'Activity' ? ["Lethargic or resting more?", "Limping while walking?", "Restless at night?"] :
      ["Aggressive towards others?", "Excessive vocalization?", "Hiding constantly?"];

    return (
      <View style={styles.wizardContainer}>
        <Text style={styles.wizardTitle}>Guide Questions</Text>
        <Text style={styles.wizardSubtitle}>Select a common concern or specify your own.</Text>
        
        {commonGuides.map((guide) => (
           <TouchableOpacity 
             key={guide}
             style={[styles.optionCard, guideQuestion === guide && styles.optionCardActive]}
             onPress={() => setGuideQuestion(guide)}
           >
             <Text style={[styles.optionCardText, guideQuestion === guide && styles.optionCardTextActive]}>{guide}</Text>
           </TouchableOpacity>
        ))}

        <Text style={styles.inputLabel}>Or enter your own question/concern:</Text>
        <TextInput 
           style={styles.textInput}
           placeholder="e.g. My pet keeps scratching its ear"
           value={guideQuestion && !commonGuides.includes(guideQuestion) ? guideQuestion : ''}
           onChangeText={setGuideQuestion}
           placeholderTextColor="#a0aec0"
        />

        <View style={styles.navButtonsRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.primaryButton, { flex: 1 }, !guideQuestion && styles.buttonDisabled]} 
            disabled={!guideQuestion}
            onPress={() => setStep(3)}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.wizardContainer}>
      <Text style={styles.wizardTitle}>Symptoms & Details</Text>
      <Text style={styles.wizardSubtitle}>What specific symptoms or behaviors have you noticed?</Text>
      
      <TextInput 
         style={[styles.textInput, styles.textArea]}
         placeholder="Describe what you observed (e.g., lethargic, didn't eat breakfast, slight limp...)"
         value={symptomsText}
         onChangeText={setSymptomsText}
         multiline
         numberOfLines={4}
         placeholderTextColor="#a0aec0"
      />

      <View style={styles.warningBox}>
         <FontAwesome5 name="info-circle" size={14} color="#3182ce" style={{marginTop: 2}} />
         <Text style={styles.warningBoxText}>Tip: Mentioning details like "blood", "seizures", or severe pain will help our system accurately assess emergency situations.</Text>
      </View>

      <View style={styles.navButtonsRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, { flex: 1 }, !symptomsText && styles.buttonDisabled]} 
          disabled={!symptomsText}
          onPress={() => setStep(4)}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.wizardContainer}>
      <Text style={styles.wizardTitle}>Follow-up Questions</Text>
      <Text style={styles.wizardSubtitle}>Just a few more details to help our system analyze.</Text>
      
      <Text style={styles.inputLabel}>How long has this been occurring?</Text>
      <View style={styles.pillRow}>
         {['< 24 hrs', '1-3 days', '> 3 days'].map(opt => (
           <TouchableOpacity 
             key={opt}
             style={[styles.pillBtn, duration === opt && styles.pillBtnActive]}
             onPress={() => setDuration(opt)}
           ><Text style={[styles.pillText, duration === opt && styles.pillTextActive]}>{opt}</Text></TouchableOpacity>
         ))}
      </View>

      <Text style={styles.inputLabel}>Has your pet experienced this before?</Text>
      <View style={styles.pillRow}>
         {['Yes', 'No', 'Not Sure'].map(opt => (
           <TouchableOpacity 
             key={opt}
             style={[styles.pillBtn, happenedBefore === opt && styles.pillBtnActive]}
             onPress={() => setHappenedBefore(opt)}
           ><Text style={[styles.pillText, happenedBefore === opt && styles.pillTextActive]}>{opt}</Text></TouchableOpacity>
         ))}
      </View>

      <Text style={styles.inputLabel}>Is your pet currently on medication?</Text>
      <View style={styles.pillRow}>
         {['Yes', 'No'].map(opt => (
           <TouchableOpacity 
             key={opt}
             style={[styles.pillBtn, onMedication === opt && styles.pillBtnActive]}
             onPress={() => setOnMedication(opt)}
           ><Text style={[styles.pillText, onMedication === opt && styles.pillTextActive]}>{opt}</Text></TouchableOpacity>
         ))}
      </View>

      <View style={styles.navButtonsRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, { flex: 1 }, (!duration || !happenedBefore || !onMedication) && styles.buttonDisabled]} 
          disabled={!duration || !happenedBefore || !onMedication}
          onPress={performAnalysis}
        >
          <Text style={styles.primaryButtonText}>Analyze Results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={[styles.wizardContainer, styles.centeredContent]}>
       <ActivityIndicator size="large" color="#2E5E3E" style={{ marginBottom: 20 }} />
       <Text style={styles.wizardTitle}>System analyzes...</Text>
       <Text style={styles.wizardSubtitle}>Please wait while we review the symptoms and questionnaire against clinical guidelines.</Text>
    </View>
  );

  const renderStep6 = () => {
    if (severity === 'worst') {
      return (
        <View style={styles.wizardContainer}>
          <View style={styles.severityIconBoxWorst}>
             <FontAwesome5 name="exclamation-triangle" size={32} color="#c53030" />
          </View>
          <Text style={styles.wizardTitle}>Critical Attention Required</Text>
          <Text style={styles.wizardSubtitle}>
            Based on the symptoms and duration provided, we strongly recommend immediate veterinary attention.
          </Text>
          
          <View style={[styles.warningBox, { backgroundColor: '#fff5f5' }]}>
            <Text style={[styles.warningBoxText, { color: '#c53030', fontWeight: '600' }]}>
              Do not wait. A vet should assess '{selectedPet}' as soon as possible.
            </Text>
          </View>

          <TouchableOpacity 
             style={[styles.primaryButton, { backgroundColor: '#c53030', marginTop: 20 }]}
             onPress={() => handleSendToClinic('critical alert')}
          >
             <Text style={styles.primaryButtonText}>Send Results to Clinic Immediately</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.backButton, { marginTop: 15, alignSelf: 'center', width: '100%', borderColor: 'transparent'}]} onPress={resetWizard}>
             <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Mild Case
      if (!isMonitoring && !monitoringComplete) {
        return (
          <View style={styles.wizardContainer}>
            <View style={styles.severityIconBoxMild}>
               <FontAwesome5 name="search-plus" size={32} color="#dd6b20" />
            </View>
            <Text style={styles.wizardTitle}>Monitor Condition</Text>
            <Text style={styles.wizardSubtitle}>
              The symptoms appear to be mild. We advise monitoring '{selectedPet}' closely for the next 24 hours.
            </Text>
            
            <View style={[styles.warningBox, { backgroundColor: '#feebc8' }]}>
              <Text style={[styles.warningBoxText, { color: '#c05621' }]}>
                Ensure they have access to fresh water and observe if symptoms worsen.
              </Text>
            </View>

            <TouchableOpacity 
               style={[styles.primaryButton, { marginTop: 20 }]}
               onPress={() => setIsMonitoring(true)}
            >
               <Text style={styles.primaryButtonText}>Start 24-Hour Monitoring</Text>
            </TouchableOpacity>
          </View>
        );
      } else if (isMonitoring && !monitoringComplete) {
        return (
          <View style={styles.wizardContainer}>
             <View style={styles.activeMonitorBox}>
                <FontAwesome5 name="clock" size={40} color="#3182ce" style={{ marginBottom: 15 }} />
                <Text style={styles.wizardTitle}>Active Monitoring</Text>
                <Text style={styles.wizardSubtitle}>We will notify you in 24 hours to check in on {selectedPet}.</Text>
                <Text style={styles.timerText}>23:59:58 remaining</Text>
             </View>

             {/* Demo Fast Forward Button */}
             <TouchableOpacity 
               style={styles.demoFastForwardBtn}
               onPress={() => {
                 setIsMonitoring(false);
                 setMonitoringComplete(true);
               }}
             >
                <FontAwesome5 name="forward" size={12} color="white" style={{marginRight: 6}} />
                <Text style={{color: 'white', fontWeight: 'bold'}}>Demo: Fast Forward 24h</Text>
             </TouchableOpacity>

             <TouchableOpacity style={[styles.backButton, { marginTop: 20}]} onPress={resetWizard}>
               <Text style={styles.backButtonText}>Cancel Monitoring</Text>
             </TouchableOpacity>
          </View>
        );
      } else if (monitoringComplete && didWorsen === null) {
        return (
          <View style={styles.wizardContainer}>
            <Text style={styles.wizardTitle}>Monitoring Complete</Text>
            <Text style={styles.wizardSubtitle}>The 24h period has ended. Has {selectedPet}'s condition worsened?</Text>
            
            <View style={styles.navButtonsRow}>
               <TouchableOpacity 
                 style={[styles.primaryButton, { flex: 1, backgroundColor: '#c53030', marginRight: 10 }]}
                 onPress={() => setDidWorsen(true)}
               ><Text style={styles.primaryButtonText}>Yes, It Worsened</Text></TouchableOpacity>
               
               <TouchableOpacity 
                 style={[styles.primaryButton, { flex: 1, backgroundColor: '#38a169', marginLeft: 10 }]}
                 onPress={() => setDidWorsen(false)}
               ><Text style={styles.primaryButtonText}>No, Not Worse</Text></TouchableOpacity>
            </View>
          </View>
        );
      } else if (didWorsen === true) {
        return (
          <View style={styles.wizardContainer}>
            <View style={styles.severityIconBoxWorst}>
               <FontAwesome5 name="exclamation-circle" size={32} color="#c53030" />
            </View>
            <Text style={styles.wizardTitle}>Please Contact Vet</Text>
            <Text style={styles.wizardSubtitle}>Since the condition worsened during the monitoring phase, professional evaluation is needed.</Text>
            
            <TouchableOpacity 
               style={[styles.primaryButton, { backgroundColor: '#c53030', marginTop: 20 }]}
               onPress={() => handleSendToClinic('urgent follow-up')}
            >
               <Text style={styles.primaryButtonText}>Send Urgent Update to Clinic</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        // didWorsen === false
        return (
          <View style={styles.wizardContainer}>
            <View style={styles.severityIconBoxSuccess}>
               <FontAwesome5 name="check-circle" size={32} color="#38a169" />
            </View>
            <Text style={styles.wizardTitle}>Recovery Summary</Text>
            <Text style={styles.wizardSubtitle}>It's great that the condition hasn't worsened. A summary report is ready.</Text>
            
            <View style={styles.reportBox}>
               <Text style={styles.reportSummaryText}>• Selected Pet: {selectedPet}</Text>
               <Text style={styles.reportSummaryText}>• Issue Category: {category}</Text>
               <Text style={styles.reportSummaryText}>• Symptoms Mapped: {guideQuestion}</Text>
               <Text style={styles.reportSummaryText}>• Outcome: Resolved/Stable after monitoring phase.</Text>
            </View>

            <TouchableOpacity 
               style={[styles.primaryButton, { marginTop: 20 }]}
               onPress={() => handleSendToClinic('summary report')}
            >
               <Text style={styles.primaryButtonText}>Send Summary Report to Vet Clinic</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.backButton, { marginTop: 15, alignSelf: 'center', width: '100%', borderColor: 'transparent'}]} onPress={resetWizard}>
               <Text style={styles.backButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Pet Monitoring</Text>
        </View>
        <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert('Help', 'Use this tool to track your pet\'s health and share records with our clinic.')}>
          <FontAwesome5 name="question-circle" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Progress Bar */}
        {step < 5 && (
            <View style={styles.progressContainer}>
               <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
               </View>
               <Text style={styles.progressText}>Step {step} of 4</Text>
            </View>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E5E3E',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  helpButton: { padding: 4 },
  mainScroll: { flex: 1, padding: 20 },
  progressContainer: { marginBottom: 20 },
  progressBarBg: {
    height: 6,
    backgroundColor: '#edf2f7',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2E5E3E',
  },
  progressText: { fontSize: 12, color: '#718096', textAlign: 'right' },
  
  wizardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  wizardTitle: { fontSize: 22, fontWeight: '700', color: '#2d3748', marginBottom: 8 },
  wizardSubtitle: { fontSize: 14, color: '#718096', marginBottom: 24, lineHeight: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 12, marginTop: 10 },
  
  petSelectorRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  petSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f7fafc',
    gap: 8,
  },
  petSelectorActive: { backgroundColor: '#2E5E3E', borderColor: '#2E5E3E' },
  petSelectorText: { fontSize: 15, fontWeight: '600', color: '#4a5568' },
  petSelectorTextActive: { color: 'white' },

  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f7fafc',
    marginBottom: 12,
  },
  optionCardActive: { borderColor: '#2E5E3E', backgroundColor: '#f0fff4' },
  optionCardText: { fontSize: 15, fontWeight: '500', color: '#4a5568' },
  optionCardTextActive: { color: '#2E5E3E', fontWeight: 'bold' },

  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  pillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    backgroundColor: '#f7fafc',
  },
  pillBtnActive: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  pillText: { fontSize: 14, color: '#4a5568', fontWeight: '500' },
  pillTextActive: { color: 'white' },

  navButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  primaryButton: {
    backgroundColor: '#2E5E3E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: { color: '#4a5568', fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#ebf8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    gap: 8,
  },
  warningBoxText: { flex: 1, fontSize: 13, color: '#2b6cb0', lineHeight: 18 },

  severityIconBoxWorst: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#fed7d7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  severityIconBoxMild: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#feebc8',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  severityIconBoxSuccess: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#c6f6d5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },

  activeMonitorBox: { alignItems: 'center', marginVertical: 30 },
  timerText: { fontSize: 24, fontWeight: 'bold', color: '#2d3748', marginTop: 10, fontFamily: 'monospace' },

  demoFastForwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#805ad5',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },

  reportBox: {
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginTop: 10,
  },
  reportSummaryText: { fontSize: 14, color: '#4a5568', marginBottom: 6, lineHeight: 20 }
});
