// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'

import { InviteTypeInterface } from '@atlasfoundation/common/src/dbmodels/InviteType'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const inviteType = sequelizeClient.define<Model<InviteTypeInterface>>(
    'invite_type',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        },
        beforeUpdate(instance: any, options: any): void {
          throw new Error("Can't update a type!")
        }
      },
      timestamps: false
    }
  )

  // eslint-disable-next-line no-unused-vars
  ;(inviteType as any).associate = (models: any): void => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(inviteType as any).hasMany(models.invite, { foreignKey: 'inviteType' })
  }

  return inviteType
}
