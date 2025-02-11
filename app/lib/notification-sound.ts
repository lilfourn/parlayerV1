interface NotificationSoundOptions {
  volume?: number;
}

// Singleton pattern for audio element
let audioElement: HTMLAudioElement | null = null;

export async function playNotificationSound({
  volume = 0.5
}: NotificationSoundOptions = {}): Promise<void> {
  try {
    if (!audioElement) {
      audioElement = new Audio('/sounds/notification.mp3');
    }

    // Reset the audio element if it's already playing
    audioElement.currentTime = 0;
    audioElement.volume = volume;

    // Play the sound
    await audioElement.play();

    // Return a promise that resolves when the sound is finished
    return new Promise((resolve) => {
      audioElement!.onended = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error('Failed to play notification sound:', error);
    return Promise.resolve();
  }
}
