// Audio permissions and browser support utilities

export interface AudioSupport {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  microphone: boolean;
}

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Check browser support for audio features
 */
export function checkAudioSupport(): AudioSupport {
  if (typeof window === 'undefined') {
    return {
      speechRecognition: false,
      speechSynthesis: false,
      microphone: false,
    };
  }

  const speechRecognition = !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );

  const speechSynthesis = 'speechSynthesis' in window;

  const microphone = !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );

  return {
    speechRecognition,
    speechSynthesis,
    microphone,
  };
}

/**
 * Check current microphone permission status
 */
export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state as PermissionStatus;
  } catch {
    // Some browsers don't support microphone permission query
    return 'unknown';
  }
}

/**
 * Request microphone permission
 * Returns true if granted, false otherwise
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately - we just needed to trigger the permission prompt
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.warn('Microphone permission denied:', error);
    return false;
  }
}

/**
 * Get user-friendly message for audio support status
 */
export function getAudioSupportMessage(support: AudioSupport): string | null {
  if (!support.speechRecognition && !support.speechSynthesis) {
    return 'Voice features are not supported in your browser. Please use Chrome or Edge for the best experience.';
  }

  if (!support.speechRecognition) {
    return 'Speech recognition is not supported in your browser. You can still use text input.';
  }

  if (!support.speechSynthesis) {
    return 'Text-to-speech is not supported in your browser. Prompts will be displayed as text only.';
  }

  if (!support.microphone) {
    return 'Microphone access is not available. Please check your browser settings.';
  }

  return null;
}

/**
 * Get user-friendly message for permission status
 */
export function getPermissionMessage(status: PermissionStatus): string | null {
  switch (status) {
    case 'denied':
      return 'Microphone access was denied. Please enable it in your browser settings to use voice input.';
    case 'prompt':
      return 'Click the microphone button to enable voice input.';
    case 'granted':
      return null;
    default:
      return null;
  }
}

/**
 * Check if we're in a secure context (HTTPS or localhost)
 * Required for Web Speech API
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext;
}

/**
 * Combined check for voice feature availability
 */
export interface VoiceFeatureStatus {
  available: boolean;
  canUseRecognition: boolean;
  canUseSynthesis: boolean;
  permissionStatus: PermissionStatus;
  message: string | null;
}

export async function checkVoiceFeatures(): Promise<VoiceFeatureStatus> {
  const support = checkAudioSupport();
  const permissionStatus = await checkMicrophonePermission();
  
  // Check secure context
  if (!isSecureContext()) {
    return {
      available: false,
      canUseRecognition: false,
      canUseSynthesis: support.speechSynthesis,
      permissionStatus: 'denied',
      message: 'Voice features require HTTPS. Please access this site via HTTPS.',
    };
  }

  const supportMessage = getAudioSupportMessage(support);
  const permissionMessage = getPermissionMessage(permissionStatus);

  const canUseRecognition = 
    support.speechRecognition && 
    support.microphone && 
    permissionStatus !== 'denied';

  return {
    available: canUseRecognition || support.speechSynthesis,
    canUseRecognition,
    canUseSynthesis: support.speechSynthesis,
    permissionStatus,
    message: supportMessage || permissionMessage,
  };
}
