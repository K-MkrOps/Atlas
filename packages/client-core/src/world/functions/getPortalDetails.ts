import { Engine } from '@atlasfoundation/engine/src/ecs/classes/Engine'
import { Entity } from '@atlasfoundation/engine/src/ecs/classes/Entity'
import { getComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { PortalComponent } from '@atlasfoundation/engine/src/scene/components/PortalComponent'
import { setRemoteLocationDetail } from '@atlasfoundation/engine/src/scene/functions/createPortal'

import { client } from '../../feathers'

export const getPortalDetails = () => {
  Engine.instance.currentWorld.portalQuery().map(async (entity: Entity): Promise<void> => {
    const portalComponent = getComponent(entity, PortalComponent)
    try {
      const portalDetails = await client.service('portal').get(portalComponent.linkedPortalId)
      if (portalDetails) {
        setRemoteLocationDetail(portalComponent, portalDetails.data.spawnPosition, portalDetails.data.spawnRotation)
        // const cubemapBakeDetails = await (
        //   await fetch(`${SERVER_URL}/cubemap/${portalDetails.data.cubemapBakeId}`, options)
        // ).json()
        // // console.log('cubemapBakeDetails', cubemapBakeDetails)
        // if (cubemapBakeDetails) {
        //   const textureLoader = new TextureLoader()
        //   const texture = textureLoader.load(cubemapBakeDetails.data.options.envMapOrigin)
        //   texture.mapping = EquirectangularRefractionMapping

        //   const portalMaterial = new MeshLambertMaterial({ envMap: texture, side: DoubleSide })

        //   portal.previewMesh.material = portalMaterial

        //   // texture.dispose()
        // }
      }
    } catch (e) {
      console.log(e)
    }
  })
}
