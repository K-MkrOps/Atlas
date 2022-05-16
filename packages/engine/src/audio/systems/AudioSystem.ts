import { dispatchAction } from '@atlasfoundation/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineService'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { BackgroundMusic } from '../components/BackgroundMusic'
import { PlaySoundEffect } from '../components/PlaySoundEffect'
import { SoundEffect } from '../components/SoundEffect'

export default async function AudioSystem(world: World) {
  const soundEffectQuery = defineQuery([SoundEffect])
  const musicQuery = defineQuery([BackgroundMusic])
  const playQuery = defineQuery([SoundEffect, PlaySoundEffect])

  /** Indicates whether the system is ready or not. */
  let audioReady = false
  /** Callbacks to be called after system is ready. */
  let callbacks: any[] = []
  /** Audio Element. */
  let audio: any

  /**
   * Call the callbacks when system is ready or push callbacks in array otherwise.
   * @param cb Callback to be called when system is ready.
   */
  const whenReady = (cb): void => {
    if (audioReady) {
      cb()
    } else {
      callbacks.push(cb)
    }
  }

  /** Enable and start audio system. */
  const startAudio = (e) => {
    window.removeEventListener('pointerdown', startAudio, true)
    console.log('starting audio')
    audioReady = true
    Engine.instance.currentWorld.audioListener.context.resume()
    dispatchAction(Engine.instance.store, EngineActions.startSuspendedContexts())

    callbacks.forEach((cb) => cb())
    callbacks = null!
  }
  window.addEventListener('pointerdown', startAudio, true)

  /**
   * Start Background music if available.
   * @param ent Entity to get the {@link audio/components/BackgroundMusic.BackgroundMusic | BackgroundMusic} Component.
   */
  const startBackgroundMusic = (ent): void => {
    const music = ent.getComponent(BackgroundMusic)
    if (music.src && !audio) {
      music.audio = new Audio()
      music.audio.loop = true
      music.audio.volume = music.volume
      music.audio.addEventListener('loadeddata', () => {
        music.audio.play()
      })
      music.audio.src = music.src
    }
  }

  /**
   * Stop Background Music.
   * @param ent Entity to get the {@link audio/components/BackgroundMusic.BackgroundMusic | BackgroundMusic} Component.
   */
  const stopBackgroundMusic = (ent): void => {
    const music = ent.getComponent(BackgroundMusic)
    if (music && music.audio) {
      music.audio.pause()
    }
  }

  /**
   * Play sound effect.
   * @param ent Entity to get the {@link audio/components/PlaySoundEffect.PlaySoundEffect | PlaySoundEffect} Component.
   */
  const playSoundEffect = (ent): void => {
    const sound = getComponent(ent, SoundEffect)
    const playTag = getComponent(ent, PlaySoundEffect)
    const audio = sound.audio[playTag.index]
    audio.volume = Math.min(Math.max(playTag.volume, 0), 1)
    audio.play()
    removeComponent(ent, PlaySoundEffect)
  }

  return () => {
    for (const entity of soundEffectQuery.enter(world)) {
      const effect = getComponent(entity, SoundEffect)
      if (!audio) {
        effect.src.forEach((src, i) => {
          if (!src) {
            return
          }

          const audio = new Audio()
          effect.audio[i] = audio
          audio.src = src
        })
      }
    }

    for (const entity of musicQuery.enter(world)) {
      whenReady(() => startBackgroundMusic(entity))
    }

    for (const entity of musicQuery.exit(world)) {
      stopBackgroundMusic(entity)
    }

    for (const entity of playQuery.enter(world)) {
      whenReady(() => playSoundEffect(entity))
    }
  }
}
