import Analytics from './analytics-setting/analytics.service'
import Authentication from './authentication-setting/authentication.service'
import Aws from './aws-setting/aws-setting.service'
import ClientSetting from './client-setting/client-setting.service'
import Email from './email-setting/email-setting.service'
import GameServer from './game-server-setting/game-server-setting.service'
import ProjectSetting from './project-setting/project-setting.service'
import RedisSetting from './redis-setting/redis-setting.service'
import ServerSetting from './server-setting/server-setting.service'

export default [
  ServerSetting,
  ClientSetting,
  GameServer,
  Email,
  Authentication,
  Aws,
  RedisSetting,
  Analytics,
  ProjectSetting
]
