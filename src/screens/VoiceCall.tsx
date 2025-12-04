import {
  Text,
  View,
  Image,
  StatusBar,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';

import LinearGradient from 'react-native-linear-gradient';
import InCallManager from 'react-native-incall-manager';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import Fonts from '../utils/fonts';
import IMAGES from '../assets/images';
import { customColors } from '../utils/Colors';
import { userState } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { RootStackParamList } from '../types/navigation';
import { getTurnIce, startVoiceCall, stopVoiceCall } from '../api/user';

//old function
async function awaitIceGatheringCompletion(
  pc: RTCPeerConnection,
  timeoutMs = 3000,
) {
  if (pc.iceGatheringState === 'complete') return;
  await new Promise<void>(resolve => {
    // @ts-ignore
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') resolve();
    };
    setTimeout(resolve, timeoutMs); // safety timeout
  });
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const VoiceCallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { user }: any = route.params;
  const { theme } = useThemeStore();

  const [callActive, setCallActive] = useState(false);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [dialingInProgress, setDialingInProgress] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [callPaused, setCallPaused] = useState(false);
  const [microphoneMuted, setMicrophoneMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [activeBridgeId, setActiveBridgeId] = useState('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamReference = useRef<any>(null);
  const dataChannelReference = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeBridgeIdRef = useRef('');
  const callTerminatedRef = useRef(false);
  const { userData, setIsCallEnded, setCallEndReason } = userState.getState();

  useEffect(() => {
    handleStartCall();

    return () => {
      logCall('🔴 Component unmounted → ending call...');
      terminateCallSession();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        logCall('🔴 Screen lost focus → ending call...');
        terminateCallSession();
      };
    }, []),
  );

  // Timer effect for call duration - pause when call is paused
  useEffect(() => {
    if (callActive && !callPaused) {
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callActive, callPaused]);

  // Reset duration when call ends
  useEffect(() => {
    if (!callActive) {
      setCallDurationSeconds(0);
    }
  }, [callActive]);

  // Format call duration
  const formatCallDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const logCall = (message: string) => {
    console.log(`[VoiceCall] ${message}`);
  };

  const handleStartCall = async () => {
    if (connectionInProgress || callActive || dialingInProgress) return;
    callTerminatedRef.current = false; // reset here
    setDialingInProgress(true);
    setConnectionInProgress(true);

    await initiateCallSession();
  };

  const initiateCallSession = async () => {
    let iceServers;
    try {
      InCallManager.start({
        media: 'audio',
        auto: false,
        ringback: false,
      }); //ringback: _BUNDLE_ or _DEFAULT_ or _DTMF_
      try {
        const ice = await getTurnIce(userData?.access_token);

        // Build TURNS/STUN list from backend response
        const iceServersData = ice.urls.map((u: string) => ({
          urls: u,
          username: ice.username,
          credential: ice.credential,
        }));

        // Assign to iceServers
        iceServers = iceServersData;

        // Log each server
        iceServersData.forEach((server: any, index: any) => {
          console.log(
            `[VoiceCall] ICE server #${index + 1}:`,
            JSON.stringify(server, null, 2),
          );
        });
        console.log('[VoiceCall] ✅ Using ICE servers from backend:', ice.urls);
      } catch (e) {
        console.warn('[VoiceCall] ⚠️ getTurnIce failed, no ICE servers:', e);
        iceServers = [];
      }
      const pc = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: 'relay',
      });

      peerConnectionRef.current = pc;

      // @ts-ignore
      pc.ontrack = event => {
        logCall(`Received remote track: ${event?.track?.kind}`);
      };

      // Helpful diagnostics
      // @ts-ignore
      pc.onconnectionstatechange = () => {
        logCall(`pc.connectionState=${pc.connectionState}`);
      };

      // @ts-ignore
      pc.oniceconnectionstatechange = () => {
        logCall(`pc.iceConnectionState=${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          logCall('🔄 ICE failed, restarting...');
          pc.restartIce();
          setTimeout(() => {
            if (
              pc.iceConnectionState === 'failed' ||
              pc.connectionState === 'failed'
            ) {
              logCall('❌ ICE restart failed. Ending call.');
              navigation.goBack();
              setIsCallEnded(true);
              setCallEndReason('Connection failed after ICE restart.');
            }
          }, 5000); // wait 5s for recovery
        }
      };
      // @ts-ignore
      pc.onicegatheringstatechange = () =>
        logCall(`pc.iceGatheringState=${pc.iceGatheringState}`);
      // @ts-ignore
      pc.onicecandidate = event => {
        if (event.candidate) {
          const cand = event.candidate.candidate; // full string
          console.log('YOUR candidate:', cand);

          // Extract candidate type from SDP line
          const match = cand.match(/typ\s(\w+)/);
          const type = match ? match[1] : 'unknown';
          console.log('Candidate type:', type);
        } else {
          console.log('ICE gathering finished');
        }
      };

      // Create DataChannel BEFORE createOffer so it’s in the SDP
      const dataChannel = pc.createDataChannel('client-events');

      dataChannelReference.current = dataChannel;

      dataChannel.onopen = () => {
        logCall('📡 Data channel open');
        // Configure session immediately when data channel opens
        setTimeout(() => {
          configureCallSession();
        }, 500); // Small delay to ensure channel is ready
      };
      dataChannel.onclose = () => logCall('📡 Data channel closed');
      dataChannel.onerror = err =>
        logCall(`📡 Data channel error: ${String(err)}`);
      dataChannel.onmessage = async (event: any) => {
        try {
          const msg = JSON.parse(String(event.data));
          if (msg.type === 'server.hangup') {
            const reason = msg.reason || 'server_end';
            logCall(`🛑 Server hangup: ${reason}`);
            await terminateCallSession(reason);
          } else if (msg.type === 'server.billing_tick') {
            logCall(
              `⏱️ Billed minute: ${msg.minute} deducted: ${msg.deducted}`,
            );
          } else if (msg.type === 'client_ice') {
            // --- ADDITIONAL ICE CANDIDATE FROM SERVER ---
            const candidate = msg.candidate;
            if (candidate && peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(candidate);
                logCall(`✅ Added remote ICE candidate: ${candidate}`);
              } catch (err: any) {
                logCall(`⚠️ Failed to add remote ICE candidate: ${err}`);
              }
            }
          } else if (msg.type === 'response.done') {
            console.log('msg on response.done::', msg); // <- fixed variable
          } else {
            logCall(`📨 Event: ${JSON.stringify(msg)}`);
          }
        } catch {
          logCall(`📨 Text: ${String(event.data)}`);
        }
      };

      // Mic
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamReference.current = stream;
      stream.getTracks().forEach((t: any) => pc.addTrack(t, stream));

      // Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await awaitIceGatheringCompletion(pc, 10000);

      const local = pc.localDescription;
      if (!local)
        throw new Error('No localDescription after setLocalDescription');

      // POST to backend
      const payload = { sdp: local.sdp, type: local.type, avatar_id: user.id };
      const res = await startVoiceCall(payload, userData?.access_token);

      // ✅ Handle any API error (500, 502, or missing response)
      if (!res || res.status === 500 || res.status === 502 || !res?.status) {
        Alert.alert(
          'Connection Error',
          'Unable to start the call due to a server issue. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
        return;
      }

      if (!res?.status) throw new Error('Bridge start failed');

      const { bridge_id, sdp, type } = res.data || {};
      setActiveBridgeId(bridge_id);
      activeBridgeIdRef.current = bridge_id; // Store in ref immediately
      logCall(`✅ Bridge started: ${bridge_id}`);

      // ADD THESE LOGS:
      console.log('=== SERVER SDP RESPONSE ===');
      console.log('SDP Type:', type);
      console.log('SDP Length:', sdp ? sdp.length : 0);
      console.log(
        'Has ICE candidates:',
        sdp ? sdp.includes('a=candidate:') : false,
      );
      console.log(
        'ICE candidate count:',
        sdp ? (sdp.match(/a=candidate:/g) || []).length : 0,
      );
      console.log('Full SDP:', sdp);
      console.log('=== END SERVER SDP ===');

      // *** APPLY REMOTE ANSWER (the missing piece) ***
      await pc.setRemoteDescription(new RTCSessionDescription({ sdp, type }));

      logCall('✅ setRemoteDescription applied');

      setCallActive(true);
      setConnectionInProgress(false);
      setDialingInProgress(false);
    } catch (error: any) {
      console.error('Error in startCall:', error);
      setConnectionInProgress(false);
      setDialingInProgress(false);
      terminateCallSession();
    }
  };

  const sendDataChannelEvent = (event: object) => {
    if (!dataChannelReference.current) {
      logCall('⚠️ Data channel is null - cannot send event');
      return;
    }

    if (dataChannelReference.current.readyState === 'open') {
      dataChannelReference.current.send(JSON.stringify(event));
      logCall(`📤 Sent event: ${JSON.stringify(event)}`);
    } else {
      logCall(
        `⚠️ Cannot send event - data channel not ready. State: ${dataChannelReference.current.readyState}`,
      );
    }
  };
  const configureCallSession = () => {
    sendDataChannelEvent({
      type: 'session.update',
      session: {
        instructions: `You are ${user?.name}. IMPORTANT: Always wait for the user to completely finish speaking before you respond. Do not interrupt or speak over the user. Listen carefully and only respond when there is clear silence indicating the user has finished their turn. Keep responses natural and conversational.`,
        turn_detection: {
          // threshold: 0.6,
          // prefix_padding_ms: 300,
          // silence_duration_ms: 1000,
          type: 'server_vad',
          threshold: 0.83, // Slightly higher to ignore minor noises
          prefix_padding_ms: 500, // Keep as is
          silence_duration_ms: 2200, // Wait longer before AI stops. nearBy 2.2 seconds
        },
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        voice: 'alloy',
        modalities: ['text', 'audio'],
        temperature: 0.7,
      },
    });

    logCall('✅ Session configured to prevent AI interruptions');
  };

  // Toggle mute functionality
  const handleToggleMute = () => {
    if (!localStreamReference.current) return;

    const audioTracks = localStreamReference.current.getAudioTracks();
    if (audioTracks.length > 0) {
      const newMutedState = !microphoneMuted;
      audioTracks.forEach((track: any) => {
        track.enabled = !newMutedState;
      });
      setMicrophoneMuted(newMutedState);
      logCall(`Microphone ${newMutedState ? 'MUTED' : 'UNMUTED'}`);
    }
  };

  // Toggle speaker functionality
  const handleToggleSpeaker = async () => {
    if (!callActive) {
      return;
    }
    const newState = !speakerEnabled;
    setSpeakerEnabled(newState);
    await handleToggleForceSpeaker(newState);
    console.log('1111 handleToggleSpeaker <<<', newState);
    logCall(`Speakerphone ${newState ? 'ON' : 'OFF'}, newState=${newState}`);
  };

  // const handleToggleForceSpeaker = (enabled: boolean) => {
  //   console.log('1111 handleToggleForceSpeaker <<<', enabled);
  //   // required for release builds
  //   InCallManager.start({ media: 'audio' });

  //   InCallManager.setSpeakerphoneOn(enabled);
  //   InCallManager.setForceSpeakerphoneOn(enabled);
  // };

  const handleToggleForceSpeaker = (enabled: boolean) => {
    console.log('handleToggleForceSpeaker <<<', enabled);

    // Must start audio before toggling
    InCallManager.start({ media: 'audio' });

    InCallManager.requestAudioFocus();

    // Normal speaker toggle
    InCallManager.setSpeakerphoneOn(enabled);

    // Force routing (use "on"/"off" for safety)
    InCallManager.setForceSpeakerphoneOn(enabled);

    console.log('force speakered =', enabled);
  };

  const handleTogglePause = () => {
    if (!callActive) return;
    const newPausedState = !callPaused;
    if (localStreamReference.current) {
      const audioTracks = localStreamReference.current.getAudioTracks();
      audioTracks.forEach((track: any) => {
        track.enabled = !newPausedState;
      });
    }

    if (newPausedState) {
      if (!microphoneMuted) setMicrophoneMuted(true);

      // cancel ongoing response
      sendDataChannelEvent({ type: 'response.cancel' });

      // stop AI from answering further
      sendDataChannelEvent({
        type: 'session.update',
        session: { turn_detection: null },
      });
    } else {
      // resume AI answering
      sendDataChannelEvent({
        type: 'session.update',
        session: { turn_detection: { type: 'server_vad' } },
      });
    }

    setCallPaused(newPausedState);
    logCall(`Call ${newPausedState ? 'PAUSED' : 'RESUMED'}`);
  };

  const terminateCallSession = async (reason?: any) => {
    if (callTerminatedRef.current) {
      console.log('⚠️ terminateCallSession already executed, skipping...');
      return;
    }
    callTerminatedRef.current = true;

    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    try {
      // Stop InCallManager
      InCallManager.stop();

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Stop local stream
      if (localStreamReference.current) {
        localStreamReference.current.getTracks().forEach((track: any) => {
          if (track && typeof track.stop === 'function') {
            track.stop();
          }
        });
        localStreamReference.current = null;
      }

      // Close data channel
      if (dataChannelReference.current) {
        try {
          dataChannelReference.current.close();
        } catch (e) {
          console.log('Error on closing dataChannel:', e);
        }
        dataChannelReference.current = null;
      }

      const currentBridgeId = activeBridgeIdRef.current || activeBridgeId;

      try {
        if (currentBridgeId) {
          await stopVoiceCall(currentBridgeId, userData.access_token)
            .then(res => {
              if (res.status) {
                navigation.goBack();
                console.log('Setting call ended:', true);
                console.log('Setting call end reason:', reason);
                setIsCallEnded(true);
                setCallEndReason(reason ?? null);
                return;
              }
            })
            .catch(e => {
              console.log('Error in stopVoiceCall::', e);
            });
        } else {
          console.error('No bridge ID available for stopping call');
        }
      } catch (error: any) {
        console.log('error in stop Call:', error);
      }
    } catch (error: any) {
      console.error('Error stopping call:', error);
    }

    // Reset states
    setCallActive(false);
    setConnectionInProgress(false);
    setDialingInProgress(false);
    setCallDurationSeconds(0);
    setCallPaused(false);
    setMicrophoneMuted(false);
    setActiveBridgeId('');
    activeBridgeIdRef.current = ''; // Clear ref
  };

  const getStatusText = () => {
    if (dialingInProgress) return 'Calling...';
    if (connectionInProgress) return 'Ringing...';
    if (callPaused)
      return `Paused - ${formatCallDuration(callDurationSeconds)}`;
    if (callActive) return formatCallDuration(callDurationSeconds);
    return 'Ready to Call';
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={'light-content'}
        translucent
        backgroundColor={'transparent'}
      />
      <ImageBackground style={{ flex: 1 }} source={IMAGES.app_splash_view2}>
        <ImageBackground
          source={{ uri: user?.image }}
          style={styles.backgroundImage}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={[
              'rgba(0, 0, 0, 0.7)',
              'rgba(0, 0, 0, 0.0)',
              'rgba(0, 0, 0, 1)',
            ]}
            style={styles.gradient}
          >
            <View style={styles.callStatus}>
              <Text style={styles.userName}>
                {user?.name || 'AI Assistant'}
              </Text>
              <Text style={styles.statusText}>{getStatusText()}</Text>
              {callPaused && (
                <Text style={styles.pausedIndicator}>Call Paused</Text>
              )}
            </View>

            <View style={styles.callContainer}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    borderColor: speakerEnabled
                      ? theme.primaryFriend
                      : customColors.white,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={handleToggleSpeaker}
                  disabled={!callActive}
                  style={styles.iconWrapper}
                >
                  <Image
                    source={IMAGES.speaker}
                    style={[
                      styles.speakerControlIcons,
                      {
                        tintColor: speakerEnabled
                          ? theme.primaryFriend
                          : customColors.white,
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.iconContainer,
                  {
                    borderColor: callPaused
                      ? theme.primaryFriend
                      : customColors.white,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={handleTogglePause}
                  disabled={!callActive}
                  style={styles.iconWrapper}
                >
                  <Image
                    source={IMAGES.play}
                    style={[
                      styles.controlIcons,
                      {
                        tintColor: callPaused
                          ? theme.primaryFriend
                          : customColors.white,
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.iconContainer,

                  {
                    borderColor: microphoneMuted
                      ? theme.primaryFriend
                      : customColors.white,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={handleToggleMute}
                  disabled={!callActive}
                  style={styles.iconWrapper}
                >
                  <Image
                    source={microphoneMuted ? IMAGES.mute : IMAGES.unmute}
                    style={[
                      styles.controlIcons,
                      {
                        tintColor: microphoneMuted
                          ? theme.primaryFriend
                          : customColors.white,
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.callButton,
                  {
                    backgroundColor: activeBridgeId ? '#db2121' : '#fa5c5c',
                  },
                ]}
                onPress={() => terminateCallSession()}
                disabled={!activeBridgeId}
              >
                <Image source={IMAGES.call} style={styles.callIcon} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </ImageBackground>
    </View>
  );
};

export default VoiceCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  callButtonContainer: {
    alignItems: 'center',
  },
  callContainer: {
    width: '90%',
    marginVertical: verticalScale(80),
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF40',
    borderColor: '#FFFFFF73',
    borderWidth: 1,
    borderRadius: scale(50),
    padding: scale(10),
  },
  iconContainer: {
    width: scale(70),
    height: scale(70),
    borderWidth: scale(1),
    backgroundColor: '#ffffff' + 50,
    borderRadius: scale(50),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callStatus: {
    alignItems: 'center',
    marginTop: verticalScale(150),
  },
  statusText: {
    color: 'white',
    fontSize: scale(18),
    marginBottom: verticalScale(10),
    fontFamily: Fonts.ISemiBold,
  },
  userName: {
    color: customColors.white,
    fontSize: scale(30),
    fontFamily: Fonts.IBold,
    // marginBottom: verticalScale(20),
  },
  pausedIndicator: {
    color: '#FF9800',
    fontSize: scale(16),
    fontFamily: Fonts.IRegular,
    marginTop: verticalScale(5),
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  controlButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(40),
    marginBottom: verticalScale(20),
  },
  controlButton: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(1),
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  controlButtonText: {
    fontSize: moderateScale(20),
    color: 'white',
    fontFamily: Fonts.IBold,
  },
  callButton: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#ef5350',
  },
  callIcon: {
    width: scale(35),
    height: verticalScale(35),
    tintColor: 'white',
  },
  speakerControlIcons: {
    width: scale(28),
    resizeMode: 'contain',
    height: verticalScale(34),
  },
  controlIcons: {
    width: scale(50),
    resizeMode: 'contain',
    height: verticalScale(50),
  },
});
