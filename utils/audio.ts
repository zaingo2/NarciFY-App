// Implemented based on provided examples in the guidelines.
export function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
  
export function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}
  
export const loadAudioFile = async (url: string, ctx: AudioContext): Promise<AudioBuffer> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio from ${url}: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
            throw new Error(`Fetched audio file from ${url} is empty.`);
        }
        // The decodeAudioData promise can also reject
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error("Error in loadAudioFile:", error);
        // Re-throw a more user-friendly or specific error
        throw new Error(`Could not load or decode background audio. Please check the network connection and try again.`);
    }
};

/**
 * Creates a synthetic impulse response for a simple reverb effect.
 * This is used by the offline audio processor to add reverb to the downloaded file.
 */
export const createImpulseResponse = (audioContext: BaseAudioContext): AudioBuffer => {
    const duration = 2.5; // seconds for the reverb tail
    const decay = 2.0;   // how quickly the reverb fades
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate); // stereo
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        // Create a decaying noise impulse
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
};

/**
 * Applies reverb and other effects to an AudioBuffer using an OfflineAudioContext.
 * This ensures that the downloaded audio file includes all audio processing.
 * @param originalBuffer The dry audio buffer to process.
 * @returns A promise that resolves with a new AudioBuffer containing the processed audio.
 */
export const applyEffectsToBuffer = async (originalBuffer: AudioBuffer): Promise<AudioBuffer> => {
    const offlineCtx = new OfflineAudioContext(
        originalBuffer.numberOfChannels,
        originalBuffer.length,
        originalBuffer.sampleRate
    );

    // Create the same audio graph as the live version
    const source = offlineCtx.createBufferSource();
    source.buffer = originalBuffer;
    
    const convolver = offlineCtx.createConvolver();
    convolver.buffer = createImpulseResponse(offlineCtx);

    const dryGain = offlineCtx.createGain();
    dryGain.gain.value = 0.7; // 70% original signal

    const wetGain = offlineCtx.createGain();
    wetGain.gain.value = 0.35; // 35% reverb signal

    source.connect(dryGain).connect(offlineCtx.destination);
    source.connect(wetGain).connect(convolver).connect(offlineCtx.destination);
    
    source.start(0);
    
    return await offlineCtx.startRendering();
};


// Standard implementation to convert an AudioBuffer to a WAV file Blob.
export const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels: Float32Array[] = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;
  
    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
  
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
  
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
  
    // write interleaved data
    for (i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }
  
    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }
  
    return new Blob([view], { type: "audio/wav" });
  
    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
  
    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
};
