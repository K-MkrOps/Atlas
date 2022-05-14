import React from 'react'
import { useTranslation } from 'react-i18next'

import { User } from '@atlasfoundation/common/src/interfaces/User'

import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../services/AuthService'
import styles from './index.module.scss'
import SingleConnection from './SingleConnection'

interface Props {
  //auth: any
  //classes: any
}

const ProfileConnections = (props: Props): JSX.Element => {
  //const { classes } = props
  const { t } = useTranslation()
  const user = useAuthState().user.value

  if (!user) {
    // window.location.href = '/'
    return <div />
  }

  return (
    <div className={styles.root}>
      <div className={styles.section1}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('user:profile.connections.title')}</Typography>
          </Grid>
        </Grid>
      </div>

      <Divider variant="middle" />
      <SingleConnection connectionType="email" />
      <Divider variant="middle" />
      <SingleConnection connectionType="sms" />
      <Divider variant="middle" />
      <SingleConnection connectionType="password" />
      <Divider variant="middle" />
      <SingleConnection connectionType="facebook" />
      <Divider variant="middle" />
      <SingleConnection connectionType="github" />
      <Divider variant="middle" />
      <SingleConnection connectionType="google" />
      <Divider variant="middle" />
      <SingleConnection connectionType="linkedin" />
    </div>
  )
}

const ProfileConnectionsWrapper = (props: Props): JSX.Element => <ProfileConnections {...props} />

export default ProfileConnectionsWrapper
