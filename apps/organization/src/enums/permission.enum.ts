export enum PermissionAction {
  ORG_READ           = 'organization:read',
  ORG_UPDATE         = 'organization:update',
  ORG_DELETE         = 'organization:delete',

  MEMBER_INVITE      = 'member:invite',
  MEMBER_READ        = 'member:read',
  MEMBER_UPDATE      = 'member:update',
  MEMBER_REMOVE      = 'member:remove',

  ROLE_CREATE        = 'role:create',
  ROLE_READ          = 'role:read',
  ROLE_UPDATE        = 'role:update',
  ROLE_DELETE        = 'role:delete',

  PERMISSION_READ    = 'permission:read',
  PERMISSION_UPDATE  = 'permission:update',
}
