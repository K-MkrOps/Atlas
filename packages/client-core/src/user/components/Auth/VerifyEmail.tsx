import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import EmptyLayout from '../../../common/components/EmptyLayout'
import { AuthService } from '../../services/AuthService'
import styles from './index.module.scss'

interface Props {
  //auth: any
  //type: string
  token: string
}

export const VerifyEmail = (props: Props): JSX.Element => {
  const { token } = props
  const { t } = useTranslation()

  useEffect(() => {
    AuthService.verifyEmail(token)
  }, [])

  return (
    <EmptyLayout>
      <Container component="main" maxWidth="md">
        <div className={styles.paper}>
          <Typography component="h1" variant="h5">
            {t('user:auth.verifyEmail.header')}
          </Typography>

          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" align="center">
              {t('user:auth.verifyEmail.processing')}
            </Typography>
          </Box>
        </div>
      </Container>
    </EmptyLayout>
  )
}
