import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { sendSMS } from '../../../../lib/twilio';
import {
  hasCriticalContent,
  generateSmartFollowUp,
  generateDiagnosis,
  generateCriticalDiagnosis,
  getSmartQuestionAnswer,
  analyzeUserText,
} from './ai-engine';

// Helper to format timestamps
function getFormattedTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initial category questions (first prompt per category)
const CATEGORY_OPENERS: Record<string, string> = {
  Health: "What is the most common health issue you are seeing with your pet? Please describe the symptoms you've noticed — for example, vomiting, unusual bowel movements, lack of appetite, coughing, skin issues, or anything else that concerns you.",
  Activity: "What seems to be the primary change in your pet's activity? Please describe what you've observed — for example, lethargy, limping, restlessness, stiffness, or reduced exercise tolerance.",
  Behavior: "What is the main behavioral concern you have? Please describe what's happening — for example, aggression, excessive vocalization, hiding, anxiety, confusion, or any unusual behavior.",
};

// Helper to check and update timer transition
async function checkAndUpdateTimer(session: any) {
  if (session && session.chatStep === 'MONITORING' && session.timerStartedAt && session.countdownDuration) {
    const start = new Date(session.timerStartedAt).getTime();
    const durationMs = session.countdownDuration * 60 * 60 * 1000;
    const now = new Date().getTime();
    if (now >= start + durationMs) {
      let messages = Array.isArray(session.chatMessages) ? [...session.chatMessages] : [];
      const checkInMsg = {
        id: 'msg_checkin_auto_' + Date.now(),
        sender: 'system',
        text: "The monitoring period has ended! How is " + session.pet.petName + " doing now? Are they feeling better, or has their condition worsened?",
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };
      messages.push(checkInMsg);

      return await prisma.petMonitoring.update({
        where: { id: session.id },
        data: {
          chatStep: 'MONITORING_DONE',
          chatMessages: messages
        },
        include: {
          pet: {
            include: {
              user: true
            }
          }
        }
      });
    }
  }
  return session;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const monitorId = searchParams.get('monitorId');

    if (monitorId) {
      let monitor = await prisma.petMonitoring.findUnique({
        where: { id: monitorId },
        include: {
          pet: {
            include: {
              user: true
            }
          }
        }
      });
      monitor = await checkAndUpdateTimer(monitor);
      return NextResponse.json({ success: true, monitor });
    }

    if (petId) {
      let activeMonitor = await prisma.petMonitoring.findFirst({
        where: {
          petId,
          status: { in: ['ACTIVE', 'CRITICAL'] }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          pet: {
            include: {
              user: true
            }
          }
        }
      });
      activeMonitor = await checkAndUpdateTimer(activeMonitor);
      return NextResponse.json({ success: true, monitor: activeMonitor });
    }

    // Otherwise fetch all active sessions for Super Admin
    const activeSessions = await prisma.petMonitoring.findMany({
      where: {
        status: { in: ['ACTIVE', 'CRITICAL'] }
      },
      include: {
        pet: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const updatedSessions = await Promise.all(
      activeSessions.map(session => checkAndUpdateTimer(session))
    );

    return NextResponse.json({ success: true, reports: updatedSessions });
  } catch (error: any) {
    console.error('Error fetching monitoring chat:', error);
    return NextResponse.json({ error: 'Failed to fetch monitoring chat', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      action, 
      monitorId, 
      petId, 
      category, 
      sender, 
      text, 
      takeoverMode: flag, 
      replyTo,
      severity,
      symptoms,
      careInstructions,
      dietInstructions,
      medications,
      note,
      doctorName
    } = body;

    // 1. START CHAT / MONITORING SESSION
    if (action === 'start') {
      if (!petId) {
        return NextResponse.json({ error: 'petId is required to start session' }, { status: 400 });
      }

      // Check pet verification status
      const pet = await (prisma.pet as any).findUnique({
        where: { id: petId },
        include: { user: true }
      });

      if (!pet) {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
      }

      if (pet.verificationStatus !== 'VERIFIED') {
        return NextResponse.json({
          error: 'This pet is pending in-person clinic verification. Please bring your pet to the clinic before monitoring can begin.',
          isPending: true
        }, { status: 403 });
      }

      // Check if there is already an active session
      const existing = await prisma.petMonitoring.findFirst({
        where: { petId, status: { in: ['ACTIVE', 'CRITICAL'] } },
        orderBy: { updatedAt: 'desc' },
        include: { pet: { include: { user: true } } }
      });
      if (existing) {
        return NextResponse.json({ success: true, monitor: existing });
      }

      const isSevere = severity === 'SEVERE';
      const initialSeverity = isSevere ? 'SEVERE' : 'MILD';
      const initialType = isSevere ? 'CLINIC_ADMISSION' : 'HOME_MONITORING';
      const initialStatus = isSevere ? 'CRITICAL' : 'ACTIVE';

      const initialCare = careInstructions || (isSevere
        ? 'Please bring your pet directly to FurEverCare Clinic immediately for clinical examination and admission.'
        : 'Keep your pet in a quiet, comfortable space. Keep hydrated and observe for changes.');

      const initialDiet = dietInstructions || (isSevere
        ? 'Withhold solid food until evaluated in clinic. Small sips of water only.'
        : 'Fresh clean water. Bland, easily digestible food (e.g. boiled chicken and rice).');

      const initialMeds = medications || (isSevere
        ? 'Do not administer human medication. Wait for clinic veterinarian evaluation.'
        : 'None prescribed yet. Awaiting veterinarian instructions.');

      const initialLogs = [
        {
          id: 'log_start_' + Date.now(),
          title: isSevere ? '🚨 Severe Condition Reported' : '🩺 Home Monitoring Initiated',
          note: symptoms ? `Reported condition: ${symptoms}` : (isSevere ? 'Emergency clinic visit advised.' : 'Home monitoring protocol active.'),
          severity: initialSeverity,
          medications: initialMeds,
          dietInstructions: initialDiet,
          careInstructions: initialCare,
          timestamp: new Date().toISOString()
        }
      ];

      const initialMessages = [
        {
          id: 'msg_start_' + Date.now(),
          sender: 'system',
          text: isSevere 
            ? `🚨 EMERGENCY ALERT: Severe symptoms reported for ${pet.petName}. Please bring your pet to FurEverCare Clinic immediately!`
            : `Hello! Home monitoring for ${pet.petName} is now active. Follow the vet care directives and use this chat anytime to consult our clinic.`,
          time: getFormattedTime(),
          timestamp: new Date().toISOString(),
          isUrgent: isSevere
        }
      ];

      const newSession = await prisma.petMonitoring.create({
        data: {
          petId,
          status: initialStatus,
          severity: initialSeverity,
          monitoringType: initialType,
          symptoms: symptoms || null,
          chatCategory: category || 'Health',
          chatStep: isSevere ? 'CRITICAL_WAITING' : 'MONITORING',
          admitRecommended: isSevere,
          timerStartedAt: new Date(),
          countdownDuration: 24,
          careInstructions: initialCare,
          dietInstructions: initialDiet,
          medications: initialMeds,
          updatesLog: initialLogs,
          chatMessages: initialMessages
        },
        include: {
          pet: { include: { user: true } }
        }
      });

      return NextResponse.json({ success: true, monitor: newSession }, { status: 201 });
    }

    // Fetch the current monitoring session for other actions
    if (!monitorId) {
      return NextResponse.json({ error: 'monitorId is required' }, { status: 400 });
    }

    const session = await prisma.petMonitoring.findUnique({
      where: { id: monitorId },
      include: { pet: { include: { user: true } } }
    });

    if (!session) {
      return NextResponse.json({ error: 'Monitoring session not found' }, { status: 404 });
    }

    let messages = Array.isArray(session.chatMessages) 
      ? [...(session.chatMessages as any[])] 
      : [];

    // 2. TOGGLE TAKEOVER MODE (Admin action)
    if (action === 'takeover') {
      const mode = flag !== undefined ? !!flag : (body.takeoverMode !== undefined ? !!body.takeoverMode : true);
      
      // Append a system message notifying both parties
      const systemMsg = {
        id: 'msg_takeover_' + Date.now(),
        sender: 'system',
        text: mode 
          ? "Our senior veterinarian has joined the chat and taken over manually." 
          : "The veterinarian has left the chat. Automated assistant is back online.",
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };
      
      messages.push(systemMsg);

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          takeoverMode: mode,
          chatMessages: messages,
          // Clear waiting flag when vet takes over
          ...(mode ? { waitingForVet: false } : {})
        },
        include: { pet: { include: { user: true } } }
      });

      return NextResponse.json({ success: true, monitor: updated });
    }

    // 2b. VET TREATMENT & CARE DIRECTIVES UPDATE (Admin / Vet action)
    if (action === 'vet_update') {
      const currentLog = Array.isArray((session as any).updatesLog) ? [...(session as any).updatesLog] : [];
      const isSevere = severity === 'SEVERE';
      
      const newEntry = {
        id: 'log_' + Date.now(),
        title: isSevere ? '🚨 Clinic Admission Required' : '🩺 Vet Directives Updated',
        note: note || (isSevere ? 'Condition evaluated as severe. Immediate clinic visit instructed.' : 'Medications and care protocol updated.'),
        severity: severity || session.severity || 'MILD',
        medications: medications !== undefined ? medications : session.medications,
        dietInstructions: dietInstructions !== undefined ? dietInstructions : session.dietInstructions,
        careInstructions: careInstructions !== undefined ? careInstructions : session.careInstructions,
        doctorName: doctorName || 'Attending Veterinarian',
        timestamp: new Date().toISOString()
      };
      currentLog.unshift(newEntry);

      const parts = [];
      if (medications) parts.push(`💊 Meds to drink/take: ${medications}`);
      if (careInstructions) parts.push(`📋 What to do: ${careInstructions}`);
      if (dietInstructions) parts.push(`🥗 What to eat: ${dietInstructions}`);
      if (note) parts.push(`💬 Note: ${note}`);

      const updateNotice = {
        id: 'msg_update_' + Date.now(),
        sender: 'admin',
        text: isSevere
          ? `🚨 URGENT NOTICE: The veterinarian has determined that ${session.pet.petName}'s condition requires immediate in-person clinic admission. Please bring your pet to FurEverCare Clinic right away!`
          : `🩺 Vet Care Directives Updated:\n${parts.join('\n')}`,
        time: getFormattedTime(),
        timestamp: new Date().toISOString(),
        isUrgent: isSevere
      };
      messages.push(updateNotice);

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          ...(medications !== undefined ? { medications } : {}),
          ...(dietInstructions !== undefined ? { dietInstructions } : {}),
          ...(careInstructions !== undefined ? { careInstructions } : {}),
          ...(severity ? {
            severity,
            status: isSevere ? 'CRITICAL' : 'ACTIVE',
            admitRecommended: isSevere
          } : {}),
          updatesLog: currentLog,
          chatMessages: messages
        },
        include: { pet: { include: { user: true } } }
      });

      return NextResponse.json({ success: true, monitor: updated });
    }

    // 3. RECOMMEND ADMISSION (Admin action)
    if (action === 'recommend_admission') {
      const recommendMsg = {
        id: 'msg_recommend_' + Date.now(),
        sender: 'admin',
        text: "URGENT VETERINARY ADVICE: Based on our assessment, we highly recommend immediate admission for " + session.pet.petName + ". Please review and accept this admission recommendation so we can prepare our clinic.",
        time: getFormattedTime(),
        timestamp: new Date().toISOString(),
        isUrgent: true
      };

      messages.push(recommendMsg);

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          admitRecommended: true,
          chatMessages: messages,
          status: 'CRITICAL'
        },
        include: { pet: { include: { user: true } } }
      });

      // Send SMS notice to owner
      if (session.pet.user.phoneNumber) {
        const smsMsg = `FurEverPawCare: Veterinarian recommends immediate admission for ${session.pet.petName}. Please check the app and bring them in.`;
        const resSMS = await sendSMS(session.pet.user.phoneNumber, smsMsg);
        await prisma.smsNotification.create({
          data: {
            userId: session.pet.user.id,
            message: smsMsg,
            notificationType: 'URGENT_ADMISSION',
            status: resSMS.success ? 'SENT' : 'FAILED'
          }
        });
      }

      return NextResponse.json({ success: true, monitor: updated });
    }

    // 4. ACCEPT ADMISSION (Owner action)
    if (action === 'accept_admission') {
      const acceptMsg = {
        id: 'msg_accept_' + Date.now(),
        sender: 'owner',
        text: "I accept the recommendation. I will admit " + session.pet.petName + " immediately.",
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };

      const warningMsg = {
        id: 'msg_warning_' + Date.now(),
        sender: 'system',
        text: "🚨 WARNING: Please bring " + session.pet.petName + " to the FurEver Paw Care Veterinary Clinic immediately! Our team has been alerted and is preparing for your arrival.",
        time: getFormattedTime(),
        timestamp: new Date().toISOString(),
        isUrgent: true
      };

      messages.push(acceptMsg);
      messages.push(warningMsg);

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          admitAccepted: true,
          status: 'CRITICAL',
          chatMessages: messages
        },
        include: { pet: { include: { user: true } } }
      });

      // Notify Superadmins
      const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      const notifications = superAdmins.map(admin => ({
        userId: admin.id,
        title: 'Emergency Admission Accepted',
        message: `Owner of ${session.pet.petName} accepted the admission recommendation. Preparing clinic.`,
      }));
      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }

      return NextResponse.json({ success: true, monitor: updated });
    }

    // 5. END SESSION (Owner or Admin action)
    if (action === 'end_session') {
      const endMsg = {
        id: 'msg_end_' + Date.now(),
        sender: 'system',
        text: "Monitoring session successfully ended. Thank you for using FurEver Paw Care Monitoring.",
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };

      messages.push(endMsg);

      const currentLog = Array.isArray((session as any).updatesLog) ? [...(session as any).updatesLog] : [];
      currentLog.unshift({
        id: 'log_end_' + Date.now(),
        title: '⏹️ Monitoring Session Concluded',
        note: 'Pet has recovered or the owner/vet decided to conclude the active monitoring session.',
        timestamp: new Date().toISOString()
      });

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          status: 'RESOLVED',
          chatStep: 'FINISHED',
          chatMessages: messages,
          updatesLog: currentLog
        },
        include: { pet: { include: { user: true } } }
      });

      return NextResponse.json({ success: true, monitor: updated });
    }

    // 5b. FAST FORWARD TIMER (Developer action)
    if (action === 'fast_forward') {
      const fastMsg = {
        id: 'msg_fast_' + Date.now(),
        sender: 'system',
        text: "⏱️ [Developer tool] Fast-forwarded timer to completion.",
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };
      
      const checkInMsg = {
        id: 'msg_checkin_' + Date.now(),
        sender: 'system',
        text: "The monitoring period has ended! How is " + session.pet.petName + " doing now? Are they feeling better, or has their condition worsened?",
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };

      messages.push(fastMsg);
      messages.push(checkInMsg);

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          chatStep: 'MONITORING_DONE',
          timerStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // set to past
          chatMessages: messages
        },
        include: { pet: { include: { user: true } } }
      });

      return NextResponse.json({ success: true, monitor: updated });
    }

    // 5c. REQUEST VET (User wants to talk to vet directly)
    if (action === 'request_vet') {
      // Already waiting? Just return queue position
      if (session.waitingForVet) {
        const queueAhead = await prisma.petMonitoring.count({
          where: {
            id: { not: monitorId },
            status: { in: ['ACTIVE', 'CRITICAL'] },
            OR: [
              { waitingForVet: true, vetRequestedAt: { lt: session.vetRequestedAt || new Date() } },
              { takeoverMode: true }
            ]
          }
        });
        return NextResponse.json({ success: true, monitor: session, queuePosition: queueAhead + 1 });
      }

      const now = new Date();

      // Calculate queue position
      const queueAhead = await prisma.petMonitoring.count({
        where: {
          id: { not: monitorId },
          status: { in: ['ACTIVE', 'CRITICAL'] },
          OR: [
            { waitingForVet: true },
            { takeoverMode: true }
          ]
        }
      });
      const queuePosition = queueAhead + 1;

      // Add system message about queueing
      const queueMsg = {
        id: 'msg_queue_' + Date.now(),
        sender: 'system',
        text: queuePosition === 1
          ? `We're redirecting you to a veterinarian now. Please wait — a vet will take over your chat shortly. 🩺\n\nIn the meantime, feel free to continue describing ${session.pet.petName}'s symptoms so we can better assist you.`
          : `We're redirecting you to a veterinarian. Please wait — you are **#${queuePosition}** in the queue. 🩺\n\nIn the meantime, feel free to continue describing ${session.pet.petName}'s symptoms so we can better assist you.`,
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };
      messages.push(queueMsg);

      const updated = await prisma.petMonitoring.update({
        where: { id: monitorId },
        data: {
          waitingForVet: true,
          vetRequestedAt: now,
          chatMessages: messages
        },
        include: { pet: { include: { user: true } } }
      });

      // Notify all admins/super admins
      const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
      const notifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Vet Requested',
        message: `${session.pet.petName}'s owner is requesting to speak with a vet directly. Queue position: #${queuePosition}.`,
      }));
      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }

      return NextResponse.json({ success: true, monitor: updated, queuePosition });
    }

    // 5d. QUEUE STATUS (Check current queue position)
    if (action === 'queue_status') {
      if (!session.waitingForVet) {
        return NextResponse.json({ success: true, queuePosition: 0, waiting: false });
      }

      const queueAhead = await prisma.petMonitoring.count({
        where: {
          id: { not: monitorId },
          status: { in: ['ACTIVE', 'CRITICAL'] },
          OR: [
            { waitingForVet: true, vetRequestedAt: { lt: session.vetRequestedAt || new Date() } },
            { takeoverMode: true }
          ]
        }
      });

      return NextResponse.json({ success: true, queuePosition: queueAhead + 1, waiting: true });
    }

    // 6. PROCESS MESSAGE SUBMISSIONS
    if (action === 'message') {
      if (!sender || !text) {
        return NextResponse.json({ error: 'sender and text are required for messaging' }, { status: 400 });
      }

      const userMsg: any = {
        id: 'msg_' + Date.now(),
        sender,
        text,
        time: getFormattedTime(),
        timestamp: new Date().toISOString()
      };

      // Attach reply reference if provided
      if (replyTo && replyTo.id) {
        userMsg.replyTo = {
          id: replyTo.id,
          sender: replyTo.sender,
          text: replyTo.text
        };
      }

      messages.push(userMsg);

      let updateData: any = {
        chatMessages: messages
      };

      // If veterinarian is typing manually (takeoverMode is active)
      if (sender === 'admin') {
        updateData.takeoverMode = true; // Auto-takeover if they reply
        updateData.waitingForVet = false; // Clear waiting queue status once vet intervenes
        const updated = await prisma.petMonitoring.update({
          where: { id: monitorId },
          data: updateData,
          include: { pet: { include: { user: true } } }
        });
        return NextResponse.json({ success: true, monitor: updated });
      }

      // If owner is sending a message
      if (sender === 'owner') {
        // If veterinarian has taken over OR pet is waiting for vet or critical, do not auto-respond with AI bot
        if (session.takeoverMode || session.waitingForVet || session.chatStep === 'CRITICAL_WAITING') {
          const updated = await prisma.petMonitoring.update({
            where: { id: monitorId },
            data: updateData,
            include: { pet: { include: { user: true } } }
          });

          // Notify admins/vets that owner sent a response in the monitoring chat
          try {
            const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
            const notifications = admins.map(admin => ({
              userId: admin.id,
              title: `Chat from ${session.pet.petName}'s owner`,
              message: text.slice(0, 100),
            }));
            if (notifications.length > 0) {
              await prisma.notification.createMany({ data: notifications });
            }
          } catch (notifErr) {
            console.error('Error creating chat notification for admins:', notifErr);
          }

          return NextResponse.json({ success: true, monitor: updated });
        }

        // ── Reusable: escalate to CRITICAL ──────────────────────────
        const escalateToCritical = async (
          criticalMatched: string[],
          allText: string,
          stepAnswers: Record<string, string>
        ) => {
          const cat = session.chatCategory || 'Health';
          const petName = session.pet.petName;
          const critDiag = generateCriticalDiagnosis(cat, allText, criticalMatched, petName);

          const diagMsg = {
            id: 'msg_bot_' + Date.now(),
            sender: 'system',
            text: critDiag.analysis + `\n\nPlease keep ${petName} calm and comfortable while our veterinarian joins.`,
            time: getFormattedTime(),
            timestamp: new Date().toISOString()
          };
          messages.push(diagMsg);

          updateData.chatMessages = messages;
          updateData.chatStep = 'CRITICAL';
          updateData.status = 'CRITICAL';
          updateData.symptoms = critDiag.condition;
          updateData.recommendations = `Suspected: ${critDiag.condition}. Immediate veterinary oversight requested.`;
          updateData.reportSummary = `Triage Category: ${cat}\n` +
            Object.entries(stepAnswers).map(([k, v]) => `- ${k}: ${v}`).join('\n');

          // Notify admins
          const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
          const notifications = admins.map(admin => ({
            userId: admin.id,
            title: 'Critical Triage Detected!',
            message: `CRITICAL diagnostic alert for ${petName}. Detected: ${criticalMatched.slice(0, 3).join(', ')}. Owner is waiting in chat.`,
          }));
          if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
          }

          // SMS alert
          if (session.pet.user.phoneNumber) {
            const smsMsg = `FurEverPawCare Alert: Crucial condition detected for ${petName}. A veterinarian is taking over your chat session.`;
            const resSMS = await sendSMS(session.pet.user.phoneNumber, smsMsg);
            await prisma.smsNotification.create({
              data: {
                userId: session.pet.user.id,
                message: smsMsg,
                notificationType: 'CRITICAL_ALERT',
                status: resSMS.success ? 'SENT' : 'FAILED'
              }
            });
          }
        };

        // ── Run AI chatbot state machine ─────────────────────────────
        const currentStep = session.chatStep || 'CHOOSE_CATEGORY';
        const petName = session.pet.petName;
        const smartPrefix = getSmartQuestionAnswer(text, petName);

        if (currentStep === 'CHOOSE_CATEGORY') {
          const cleanedText = text.trim().toLowerCase();
          let chosenCat = '';
          if (cleanedText.includes('health')) chosenCat = 'Health';
          else if (cleanedText.includes('activity')) chosenCat = 'Activity';
          else if (cleanedText.includes('behavior')) chosenCat = 'Behavior';

          if (!chosenCat) {
            let replyText = "I didn't quite catch that. Please select one of the categories: **Health**, **Activity**, or **Behavior**.";
            if (smartPrefix) {
              replyText = `${smartPrefix}\n\n---\n\n${replyText}`;
            }
            const replyMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: replyText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(replyMsg);
            updateData.chatMessages = messages;
          } else {
            const opener = CATEGORY_OPENERS[chosenCat] || CATEGORY_OPENERS.Health;
            let replyText = `Got it, let's assess **${chosenCat}** for ${petName}. 🩺\n\n${opener}`;
            if (smartPrefix) {
              replyText = `${smartPrefix}\n\n---\n\n${replyText}`;
            }
            const replyMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: replyText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(replyMsg);
            updateData.chatMessages = messages;
            updateData.chatStep = 'QUESTION_1';
            updateData.chatCategory = chosenCat;
          }
        }
        // ── QUESTION 1: Main symptom ────────────────────────────────
        else if (currentStep === 'QUESTION_1') {
          const cat = session.chatCategory || 'Health';

          // Critical check at Q1
          const critCheck = hasCriticalContent(text);
          if (critCheck.found) {
            await escalateToCritical(critCheck.matched, text, { 'Q1 Answer': text });
            updateData.q1Answer = text;
          } else {
            const followUp = generateSmartFollowUp(cat, 'QUESTION_1', text, petName);
            let replyText = followUp;
            if (smartPrefix) {
              replyText = `${smartPrefix}\n\n---\n\n${replyText}`;
            }
            const replyMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: replyText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(replyMsg);
            updateData.chatMessages = messages;
            updateData.chatStep = 'QUESTION_2';
            updateData.q1Answer = text;
          }
        }
        // ── QUESTION 2: Severity / distress ─────────────────────────
        else if (currentStep === 'QUESTION_2') {
          const cat = session.chatCategory || 'Health';
          const allTextSoFar = `${session.q1Answer} ${text}`;

          // Critical check at Q2
          const critCheck = hasCriticalContent(allTextSoFar);
          if (critCheck.found) {
            await escalateToCritical(critCheck.matched, allTextSoFar, {
              'Q1 Answer': session.q1Answer || '',
              'Q2 Answer': text
            });
            updateData.q2Answer = text;
          } else {
            const followUp = generateSmartFollowUp(cat, 'QUESTION_2', text, petName);
            let replyText = followUp;
            if (smartPrefix) {
              replyText = `${smartPrefix}\n\n---\n\n${replyText}`;
            }
            const replyMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: replyText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(replyMsg);
            updateData.chatMessages = messages;
            updateData.chatStep = 'QUESTION_3';
            updateData.q2Answer = text;
          }
        }
        // ── QUESTION 3: Duration & frequency ────────────────────────
        else if (currentStep === 'QUESTION_3') {
          const cat = session.chatCategory || 'Health';
          const allTextSoFar = `${session.q1Answer} ${session.q2Answer} ${text}`;

          // Critical check at Q3
          const critCheck = hasCriticalContent(allTextSoFar);
          if (critCheck.found) {
            await escalateToCritical(critCheck.matched, allTextSoFar, {
              'Q1 Answer': session.q1Answer || '',
              'Q2 Answer': session.q2Answer || '',
              'Q3 Answer (Duration)': text
            });
            updateData.detailsAnswer = text;
          } else {
            const followUp = generateSmartFollowUp(cat, 'QUESTION_3', text, petName);
            let replyText = followUp;
            if (smartPrefix) {
              replyText = `${smartPrefix}\n\n---\n\n${replyText}`;
            }
            const replyMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: replyText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(replyMsg);
            updateData.chatMessages = messages;
            updateData.chatStep = 'QUESTION_4';
            updateData.detailsAnswer = text;
          }
        }
        // ── QUESTION 4: Context / final details → Diagnosis ─────────
        else if (currentStep === 'QUESTION_4') {
          const cat = session.chatCategory || 'Health';
          const allText = `${session.q1Answer} ${session.q2Answer} ${session.detailsAnswer} ${text}`;

          // Critical check at Q4
          const critCheck = hasCriticalContent(allText);
          if (critCheck.found) {
            await escalateToCritical(critCheck.matched, allText, {
              'Q1 Answer': session.q1Answer || '',
              'Q2 Answer': session.q2Answer || '',
              'Q3 Answer (Duration)': session.detailsAnswer || '',
              'Q4 Answer (Context)': text
            });
          } else {
            // Generate AI diagnosis
            const diag = generateDiagnosis(cat, {
              q1: session.q1Answer || '',
              q2: session.q2Answer || '',
              q3: session.detailsAnswer || '',
              q4: text
            }, petName);

            let diagText = `📋 **Preliminary Assessment Complete** 📋\n\n${diag.analysis}\n\n**Home Care Recommendations:**\n${diag.careTips}\n\n⚠️ **Watch for:** ${diag.warningSign}\n\nWe recommend monitoring ${petName} for the next **${diag.monitorHours} hours**. A countdown timer has been activated. If anything worsens, let us know immediately.`;
            if (smartPrefix) {
              diagText = `${smartPrefix}\n\n---\n\n${diagText}`;
            }

            const diagMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: diagText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(diagMsg);

            updateData.chatMessages = messages;
            updateData.chatStep = 'MONITORING';
            updateData.countdownDuration = diag.monitorHours;
            updateData.timerStartedAt = new Date();
            updateData.symptoms = diag.condition;
            updateData.recommendations = `${diag.condition} (Severity: ${diag.severity}). Monitor for ${diag.monitorHours}h.\nCare: ${diag.careTips}`;
            updateData.reportSummary = `Triage Category: ${cat}\n- Q1 (Symptom): ${session.q1Answer}\n- Q2 (Severity): ${session.q2Answer}\n- Q3 (Duration): ${session.detailsAnswer}\n- Q4 (Context): ${text}\n- AI Diagnosis: ${diag.condition} [${diag.severity}]`;
          }
        }
        // ── MONITORING: Active watch period ──────────────────────────
        else if (currentStep === 'MONITORING') {
          const textLower = text.toLowerCase();

          // Check for critical keywords even during monitoring
          const critCheck = hasCriticalContent(text);
          if (critCheck.found || textLower.includes('worse') || textLower.includes('worsened') || textLower.includes('bad') || textLower.includes('sick') || textLower.includes('emergency')) {
            const upgradeMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: `⚠️ **Condition Escalated** ⚠️\nBased on your update, we have elevated this session to CRITICAL priority. Our senior veterinarian has been alerted and will take over this chat to provide direct guidance.\n\nPlease keep ${petName} calm and comfortable.`,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(upgradeMsg);
            updateData.chatStep = 'CRITICAL';
            updateData.status = 'CRITICAL';
            updateData.recommendations = "Condition worsened during active monitoring. Immediate veterinarian override requested.";
            updateData.symptoms = "Escalated: Worsening Symptoms";
            updateData.reportSummary = `Triage Category: ${session.chatCategory}\n- Q1: ${session.q1Answer}\n- Q2: ${session.q2Answer}\n- Q3: ${session.detailsAnswer}\n- Monitoring Update: ${text} (ESCALATED)`;

            // Notify admins
            const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
            const notifications = admins.map(admin => ({
              userId: admin.id,
              title: 'Escalated Triage: ' + petName,
              message: `Owner reported worsening condition for ${petName} during monitoring.`,
            }));
            if (notifications.length > 0) {
              await prisma.notification.createMany({ data: notifications });
            }
          } else {
            // Build a smart, contextual response during monitoring
            // Priority 1: smartPrefix handles specific questions (meds, toxic foods, wound care, etc.)
            // Priority 2: symptom analysis on the current message
            // Priority 3: contextual empathetic fallback

            let replyText = '';

            if (smartPrefix) {
              // Owner asked a specific, answerable question — answer it directly
              const cat = session.chatCategory || 'Health';
              const symptomAnalysis = analyzeUserText(text, cat);
              if (symptomAnalysis.matchedSymptoms.length > 0 && symptomAnalysis.matchedSymptoms[0]) {
                const p = symptomAnalysis.matchedSymptoms[0];
                replyText = `${smartPrefix}\n\n---\n\n🩺 **Monitoring Note**: Regarding ${petName}'s **${p.condition}** — ${p.careTips}\n\n⚠️ Watch for: ${p.warningSign}`;
              } else {
                replyText = `${smartPrefix}\n\n---\n\nWe are actively monitoring ${petName}. If you notice any worsening in their condition, please describe it right away and our team will escalate immediately.`;
              }
            } else {
              // No specific question detected — analyze the symptom text intelligently
              const cat = session.chatCategory || 'Health';
              const symptomAnalysis = analyzeUserText(text, cat);

              if (symptomAnalysis.matchedSymptoms.length > 0 && symptomAnalysis.matchedSymptoms[0]) {
                const p = symptomAnalysis.matchedSymptoms[0];
                replyText = `Thank you for updating us on ${petName}. Based on what you've described, this appears consistent with **${p.condition}**.\n\n💊 **Current Care Tip**: ${p.careTips}\n\n⚠️ **Watch for**: ${p.warningSign}\n\nWe are in active monitoring. If anything worsens, describe it immediately and our veterinary team will be alerted.`;
              } else if (
                textLower.includes('ok') || textLower.includes('okay') || textLower.includes('fine') ||
                textLower.includes('better') || textLower.includes('improved') || textLower.includes('good') || textLower.includes('normal')
              ) {
                replyText = `That's encouraging to hear! 🐾 Glad ${petName} seems to be doing better. We're still in the active monitoring window — please continue to observe them and update us with any changes.\n\nOnce the monitoring countdown ends, we'll do a formal check-in to assess if the session can be closed.`;
              } else if (
                textLower.includes('thank') || textLower.includes('thanks') || textLower.includes('okay noted') ||
                textLower.includes('got it') || textLower.includes('understood')
              ) {
                replyText = `You're welcome! 🩺 We're here with you throughout this monitoring session. Please don't hesitate to send us any updates or questions about ${petName}'s condition. Our team is watching this session closely.`;
              } else {
                replyText = `Thank you for keeping us updated on ${petName}. 🩺 We are currently in the active monitoring phase.\n\nIf you have concerns or notice any changes — such as vomiting, difficulty breathing, reduced responsiveness, or any new symptoms — please describe them right away and we will escalate to our veterinary team immediately.\n\nYou can also ask us any specific questions about ${petName}'s care, medications, or diet at any time.`;
              }
            }

            const replyMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: replyText,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(replyMsg);
          }
          updateData.chatMessages = messages;
        }

        // ── MONITORING_DONE: Check-in ───────────────────────────────
        else if (currentStep === 'MONITORING_DONE') {
          const textLower = text.toLowerCase();
          const isGood = textLower.includes('good') || textLower.includes('better') || textLower.includes('improved') || textLower.includes('fine') || textLower.includes('ok') || textLower.includes('recovered') || textLower.includes('normal');

          if (isGood) {
            const finalMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: `That's wonderful to hear! 🎉 Since ${petName} is doing better, we can close this monitoring session. Please click the **End Chat Session** button below to complete.\n\nRemember: if any symptoms return, you can start a new monitoring session anytime.`,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(finalMsg);
            updateData.chatStep = 'FINISHED';
          } else {
            const escalateMsg = {
              id: 'msg_bot_' + Date.now(),
              sender: 'system',
              text: `Understood. Since ${petName}'s symptoms persist or have worsened, we are escalating this case to our veterinary team. A veterinarian has been alerted and will take over the chat to provide direct guidance.`,
              time: getFormattedTime(),
              timestamp: new Date().toISOString()
            };
            messages.push(escalateMsg);
            updateData.chatStep = 'CRITICAL';
            updateData.status = 'CRITICAL';

            // Notify admins for monitoring escalation
            const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
            const notifications = admins.map(admin => ({
              userId: admin.id,
              title: 'Post-Monitor Escalation: ' + petName,
              message: `${petName}'s condition did not improve after monitoring. Owner reports: ${text.slice(0, 100)}`,
            }));
            if (notifications.length > 0) {
              await prisma.notification.createMany({ data: notifications });
            }
          }
          updateData.chatMessages = messages;
        }

        const updated = await prisma.petMonitoring.update({
          where: { id: monitorId },
          data: updateData,
          include: { pet: { include: { user: true } } }
        });

        return NextResponse.json({ success: true, monitor: updated });
      }
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error executing chat action:', error);
    return NextResponse.json({ error: 'Failed to execute chat action', details: error.message }, { status: 500 });
  }
}
