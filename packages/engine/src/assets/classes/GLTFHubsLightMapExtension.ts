// https://github.com/mozilla/hubs/blob/27eb7f3d9eba3b938f1ca47ed5b161547b6fb3f2/src/components/gltf-model-plus.js
import { RepeatWrapping, Texture } from 'three'

import { GLTFParser } from '../loaders/gltf/GLTFLoader'

export class GLTFHubsLightMapExtension {
  name = 'MOZ_lightmap'

  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  // @TODO: Ideally we should use extendMaterialParams hook.
  loadMaterial(materialIndex) {
    const parser = this.parser
    const json = parser.json
    const materialDef = json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return null
    }

    const extensionDef = materialDef.extensions[this.name]

    const pending: any[] = []

    pending.push(parser.loadMaterial(materialIndex))
    pending.push(parser.getDependency('texture', extensionDef.index))

    return Promise.all(pending).then((results) => {
      const material = results[0]
      const lightMap = results[1]

      const transform = extensionDef.extensions ? extensionDef.extensions['KHR_texture_transform'] : undefined
      if (transform !== undefined) {
        lightMap.wrapS = RepeatWrapping
        lightMap.wrapT = RepeatWrapping
        lightMap.offset.x = transform.offset[0]
        lightMap.offset.y = transform.offset[1]
        lightMap.repeat.x = transform.scale[0]
        lightMap.repeat.y = transform.scale[1]
      }
      material.lightMap = lightMap
      material.lightMapIntensity = extensionDef.intensity ?? 1.0
      return material
    })
  }
  /*
  loadTexture( textureIndex ) {

		const parser = this.parser;
		const json = parser.json;
    const name = this.name;
		const textureDef = json.textures[ textureIndex ];

		const source = textureDef.source
		const loader = parser.options.ktx2Loader;

		if ( ! loader ) {

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage( textureIndex, source, loader );

	}*/
}
