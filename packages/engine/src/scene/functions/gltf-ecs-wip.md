# ECS GLTF Object Metadata

The gltf format and all threejs objects support userData / user properties, which can store arbitrary data as JSON. This can enable interop and usage of data outside of the atlas ecosystem.


Model userData properties

```ts
{
  [atlas.entity]: name
  [atlas.prefab-type.property]: value
  [atlas.component-type.property]: value
}
```

Golf holes example

```ts
{
  "atlas.entity": “GolfHole-0"
  "atlas.box-collider.isTrigger": true
  "atlas.CustomComponent.value": 12345
}
```

would result in an entity with components

NameComponent { name: "GolfHole-0" }
TransformComponent { position, rotation, scale } (from mesh relative to world origin)
Object3DComponent { value: (the mesh this was loaded from) }
ColliderComponent { body: (a physics trigger box body) }
CustomComponent: { value: 12345 }