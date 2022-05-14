import { DataTypes, Model, Sequelize } from 'sequelize'

import { BotCommandInterface } from '@atlasfoundation/common/src/dbmodels/BotCommand'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const BotCommand = sequelizeClient.define<Model<BotCommandInterface>>(
    'botCommand',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )
  ;(BotCommand as any).associate = (models: any): void => {
    ;(BotCommand as any).belongsTo(models.bot, { foreignKey: 'botId' })
  }

  return BotCommand
}
