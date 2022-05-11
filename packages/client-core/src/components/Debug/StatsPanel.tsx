import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Stats from 'stats.js'

import styles from './styles.module.scss'

export const StatsPanel = (props: { show: boolean; resetCounter: number }) => {
  const { t } = useTranslation()
  const [statsArray, setStatsArray] = useState<Stats[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  let animateId = 0

  useEffect(() => {
    return () => cancelAnimationFrame(animateId)
  }, [])

  useEffect(() => {
    setupStatsArray()
    if (props.show) animateId = requestAnimationFrame(animate)
    else cancelAnimationFrame(animateId)
  }, [props.show, props.resetCounter])

  const setupStatsArray = () => {
    if (!statsRef.current) return

    statsRef.current.innerHTML = ''

    for (let i = 0; i < 3; i++) {
      statsArray[i] = new Stats()
      statsArray[i].showPanel(i)
      statsRef.current?.appendChild(statsArray[i].dom)
    }

    setStatsArray([...statsArray])
  }

  const animate = () => {
    for (const stats of statsArray) stats.update()
    animateId = requestAnimationFrame(animate)
  }

  return (
    <div className={styles.statsContainer}>
      <h1>{t('common:debug.stats')}</h1>
      <div ref={statsRef} className={styles.statsBlock} />
    </div>
  )
}
