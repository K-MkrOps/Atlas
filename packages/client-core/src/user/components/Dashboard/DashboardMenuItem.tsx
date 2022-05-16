import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, withRouter } from 'react-router-dom'

import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import { useAuthState } from '../../services/AuthService'
import { SidebarItems } from './DashboardItems'
import styles from './index.module.scss'

interface Props {
  //authState?: any
  location: any
}

const DashboardMenuItem = (props: Props) => {
  const { location } = props
  const { pathname } = location
  const scopes = useAuthState().user?.scopes?.value || []
  const { t } = useTranslation()

  let allowedRoutes = {
    routes: true,
    location: false,
    user: false,
    bot: false,
    party: false,
    groups: false,
    instance: false,
    invite: false,
    globalAvatars: false,
    benchmarking: false,
    projects: false
  }

  scopes.forEach((scope) => {
    if (Object.keys(allowedRoutes).includes(scope.type.split(':')[0])) {
      if (scope.type.split(':')[1] === 'read') {
        allowedRoutes = {
          ...allowedRoutes,
          [scope.type.split(':')[0]]: true
        }
      }
    }
  })

  return (
    <>
      <Divider />
      <List>
        {SidebarItems(allowedRoutes)
          .filter(Boolean)
          .map((sidebarItem, index) => {
            return (
              <Link key={index} to={sidebarItem.path} className={styles.textLink}>
                <ListItem
                  classes={{ selected: styles.selected }}
                  style={{ color: 'white' }}
                  selected={sidebarItem.path === pathname}
                  button
                >
                  <ListItemIcon>{sidebarItem.icon}</ListItemIcon>
                  <ListItemText primary={t(sidebarItem.name)} />
                </ListItem>
              </Link>
            )
          })}
      </List>
    </>
  )
}

export default withRouter(DashboardMenuItem)
