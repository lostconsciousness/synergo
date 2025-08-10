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

  BOARD_CREATE       = 'board:create',
  BOARD_READ         = 'board:read',
  BOARD_UPDATE       = 'board:update',
  BOARD_DELETE       = 'board:delete',

  COLUMN_CREATE      = 'column:create',
  COLUMN_READ        = 'column:read',
  COLUMN_UPDATE      = 'column:update',
  COLUMN_DELETE      = 'column:delete',

  TASK_CREATE        = 'task:create',
  TASK_READ          = 'task:read',
  TASK_UPDATE        = 'task:update',
  TASK_DELETE        = 'task:delete',
  TASK_MOVE          = 'task:move',    
  TASK_ASSIGN        = 'task:assign',  
  TASK_TAG_UPDATE    = 'task:tag:update',
}
