/**
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */
import { Matrix4 } from 'three'

import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@atlas/engine/src/ecs/classes/EntityTree'

export const IDENTITY_MAT_4 = new Matrix4().identity()

export interface CommandParams {
  shouldEmitEvent?: boolean
  isObjectSelected?: boolean
  keepHistory?: boolean
}

export default class Command {
  /** Id of the commnad used to track undo and redo state */
  id: number = -1

  /** An Object which is affected by this command */
  affectedObjects: EntityTreeNode[]

  /** Name to be print on debug string */
  displayName?: string

  /** Whether the event should be emited of not */
  shouldEmitEvent: boolean

  /** Whether the object is selected or not */
  isSelected?: boolean

  /** Old selected objects prior to this command execution */
  oldSelection: Entity[]

  /** Whether this command should keep old data of the objects. Which will be used in unod operations */
  keepHistory?: boolean

  constructor(objects: EntityTreeNode[], params: CommandParams = {}) {
    this.affectedObjects = objects.slice(0)
    this.shouldEmitEvent = params.shouldEmitEvent ?? true
    this.isSelected = params.isObjectSelected ?? true
    this.keepHistory = params.keepHistory
  }

  /** Executes the command logic */
  execute(_?: boolean): void {}

  /** Checks whether the command should update its state or not */
  shouldUpdate(_: Command): boolean {
    return false
  }

  /** Updates the commnad state */
  update(_: Command): void {}

  /** Undo the command effect */
  undo(): void {}

  /** Returns the string representation of the command */
  toString(): string {
    return `${this.displayName ?? this.constructor.name} id: ${this.id}`
  }

  /** Emits event before executing this function */
  emitBeforeExecuteEvent() {}

  /** Emits event after executing this function */
  emitAfterExecuteEvent() {}
}
