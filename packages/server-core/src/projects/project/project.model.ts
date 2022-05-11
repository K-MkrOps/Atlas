import { DataTypes, Model, Sequelize } from 'sequelize'

import { ProjectInterface } from '@atlas/common/src/dbmodels/Project'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Project = sequelizeClient.define<Model<ProjectInterface>>(
    'project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      thumbnail: {
        type: DataTypes.STRING
      },
      storageProviderPath: {
        type: DataTypes.STRING
      },
      repositoryPath: {
        type: DataTypes.STRING
      },
      settings: {
        type: DataTypes.STRING
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

  ;(Project as any).associate = (models: any): void => {}

  return Project
}
