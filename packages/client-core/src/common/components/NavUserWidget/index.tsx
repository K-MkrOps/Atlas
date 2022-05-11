import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'

import { useDispatch } from '../../../store'
import SignIn from '../../../user/components/Auth/Login'
import Dropdown from '../../../user/components/Profile/ProfileDropdown'
import { useAuthState } from '../../../user/services/AuthService'
import { AuthService } from '../../../user/services/AuthService'
import { DialogAction } from '../../services/DialogService'
import styles from './index.module.scss'

interface Props {
  login?: boolean
}

const NavUserBadge = (props: Props): any => {
  const { login } = props
  const dispatch = useDispatch()

  const { t } = useTranslation()
  useEffect(() => {
    handleLogin()
  }, [])

  const handleLogout = () => {
    AuthService.logoutUser()
  }

  const handleLogin = () => {
    const params = new URLSearchParams(document.location.search)
    const showLoginDialog = params.get('login')
    if (showLoginDialog === String(true)) {
      dispatch(DialogAction.dialogShow({ children: <SignIn /> }))
    }
  }
  const auth = useAuthState()
  const isLoggedIn = auth.isLoggedIn.value
  const user = auth.user
  // const userName = user && user.name

  return (
    <div className={styles.userWidget}>
      {isLoggedIn && (
        <div className={styles.flex}>
          <Dropdown avatarUrl={user.avatarUrl?.value} logoutUser={handleLogout} />
        </div>
      )}
      {!isLoggedIn && login === true && (
        <Button
          variant="contained"
          color="primary"
          className={styles.loginButton}
          onClick={() =>
            dispatch(
              DialogAction.dialogShow({
                children: <SignIn />
              })
            )
          }
        >
          {t('common:navUserWidget.login')}
        </Button>
      )}
    </div>
  )
}

export default NavUserBadge
