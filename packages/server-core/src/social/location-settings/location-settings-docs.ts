/**
 * An object for swagger documentation configiration
 *
 */
export default {
  definitions: {
    'location-settings': {
      type: 'object',
      properties: {
        videoEnabled: {
          type: 'boolean'
        },
        instanceMediaChatEnabled: {
          type: 'boolean'
        }
      }
    },
    'location-settings_list': {
      type: 'array',
      items: { $ref: '#/definitions/location-settings' }
    }
  }
}
