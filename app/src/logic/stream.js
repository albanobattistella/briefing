import { trackException, trackSilentException } from '../bugs'

const log = require('debug')('app:stream')

export async function getDevices() {
  try {
    return navigator.mediaDevices.enumerateDevices()
  } catch (err) {
    trackSilentException(err)
  }
  return []
}

export let bandwidthVideoConstraints = {
  video: {
    width: { ideal: 320 },
    height: { ideal: 240 },
  },
  width: { ideal: 320 },
  height: { ideal: 240 },
}

export let defaultVideoConstraints = {
  frameRate: {
    min: 1,
    ideal: 15,
  },
}

export let defaultAudioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}

export async function getUserMedia(constraints = {
  audio: {
    ...defaultAudioConstraints,
  },
  video: {
    ...defaultVideoConstraints,
    facingMode: 'user',
  },
}) {
  try {
    // Solution via https://stackoverflow.com/a/47958949/140927
    // Only available for HTTPS! See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Security
    if (!navigator?.mediaDevices?.getUserMedia) {
      return { error: 'Accessing the media devices is not available.' }
    }
    log('getUserMedia constraints', constraints)
    let stream = await navigator.mediaDevices.getUserMedia(constraints)
    return { stream }
  } catch (err) {
    const name = err?.name || err?.toString()
    if (name === 'NotAllowedError') {
      return { error: 'You denied access to your camera and microphone. Please check your setup.' }
    } else if (name === 'NotFoundError') {
      return { error: 'No camera or microphone has been found!' }
    }
    trackException(err)
    return { error: err?.message || err?.name || err.toString() }
  }
}

export async function getDisplayMedia(constraints = {
  video: {
    cursor: 'always',
  },
}) {
  try {
    if (!navigator?.mediaDevices?.getDisplayMedia) {
      return { error: 'Accessing the desktop is not available.' }
    }
    // Solution via https://stackoverflow.com/a/47958949/140927
    // Only available for HTTPS! See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Security
    log('getDisplayMedia constraints', constraints)
    let stream = await navigator.mediaDevices.getDisplayMedia(constraints)
    return { stream }
  } catch (err) {
    const name = err?.name || err?.toString()
    if (name === 'NotAllowedError') {
      return { error: 'You denied access to your camera and microphone. Please check your setup.' }
    } else if (name === 'NotFoundError') {
      return { error: 'No camera or microphone has been found!' }
    }
    trackException(err)
    return { error: err?.message || err?.name || err.toString() }
  }
}

export function setAudioTracks(stream, audioTracks) {
  Array.from(stream.getAudioTracks()).forEach(t => stream.removeTrack(t))
  audioTracks.forEach(t => {
    try {
      stream.addTrack(t)
    } catch (err) {
      trackSilentException(err)
    }
  })
  return stream
}

