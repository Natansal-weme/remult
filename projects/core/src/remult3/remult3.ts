import type { ErrorInfo, FieldOptions } from '../../index.js'
import type { ClassType } from '../../classType.js'
import type { entityEventListener } from '../__EntityValueProvider.js'
import type { FieldMetadata } from '../column-interfaces.js'
import type { EntityOptions } from '../entity.js'
import type {
  LiveQueryChange,
  SubscriptionListener,
  Unsubscribe,
} from '../live-query/SubscriptionChannel.js'
import type { SortSegment } from '../sort.js'
import type { EntityBase } from './RepositoryImplementation.js'

export interface EntityRefBase<entityType> extends Subscribable {
  hasErrors(): boolean
  undoChanges(): void
  save(): Promise<entityType>
  reload(): Promise<entityType>
  delete(): Promise<void>
  isNew(): boolean //
  wasChanged(): boolean
  wasDeleted(): boolean
  error: string | undefined
  getId(): idType<entityType>
  getOriginalId(): idType<entityType>
  repository: Repository<unknown> //unknown for hagai ts 4.6
  metadata: EntityMetadata<unknown> //unknown for hagai ts 4.6
  toApiJson(): any
  validate(): Promise<ErrorInfo<entityType> | undefined>
  readonly apiUpdateAllowed: boolean
  readonly apiDeleteAllowed: boolean
  readonly apiInsertAllowed: boolean
  readonly isLoading: boolean
  clone(): entityType
}

export interface EntityRef<entityType> extends EntityRefBase<entityType> {
  fields: FieldsRef<entityType>
  relations: RepositoryRelations<entityType>
}

export interface EntityRefForEntityBase<entityType>
  extends EntityRefBase<entityType> {
  fields: FieldsRefForEntityBase<entityType>
  relations: RepositoryRelationsForEntityBase<entityType>
}

export interface ValidateFieldEvent<entityType = unknown, valueType = unknown> {
  error?: string
  value: valueType
  originalValue: valueType
  valueChanged(): boolean
  entityRef: EntityRef<entityType>
  metadata: FieldMetadata<valueType>
  load(): Promise<valueType>
  valueIsNull(): boolean
  originalValueIsNull(): boolean
  isBackend(): boolean
  isNew: boolean
}

/**
 * Represents a lifecycle event associated with an entity instance. These events
 * are triggered during various stages of the entity's lifecycle, such as validation,
 * saving, saved, deleting, and deleted.
 *
 * @template entityType The type of the entity associated with the event.
 * @see [Entity Lifecycle Hooks](http://remult.dev/docs/lifecycle-hooks)
 */
export interface LifecycleEvent<entityType> {
  /**
   * Indicates whether the entity is new or existing.
   */
  isNew: boolean

  /**
   * A reference to the fields of the entity, providing access to its properties.
   */
  fields: FieldsRef<entityType>

  /**
   * The ID of the entity.
   */
  id: idType<entityType>

  /**
   * The original ID of the entity, useful for tracking changes.
   */
  originalId: idType<entityType>

  /**
   * The repository associated with the entity, providing access to repository methods.
   */
  repository: Repository<entityType>

  /**
   * Metadata describing the entity's structure and configuration.
   */
  metadata: EntityMetadata<entityType>

  /**
   * A function that can be used to prevent the default behavior associated with
   * the lifecycle event.
   */
  preventDefault: VoidFunction

  /**
   * A reference to the repository relations associated with the entity, providing
   * access to related entities and their data.
   */
  relations: RepositoryRelations<entityType>
}
export interface ControllerRefBase<entityType> extends Subscribable {
  hasErrors(): boolean
  error: string | undefined
  validate(): Promise<ErrorInfo<entityType> | undefined>
  readonly isLoading: boolean
}

export interface ControllerRef<entityType>
  extends ControllerRefBase<entityType> {
  fields: FieldsRef<entityType>
}

export interface ControllerRefForControllerBase<entityType>
  extends ControllerRefBase<entityType> {
  fields: FieldsRefForEntityBase<entityType>
}

export interface RefSubscriberBase {
  reportChanged: () => void
  reportObserved: () => void
}
export declare type RefSubscriber = (() => void) | RefSubscriberBase
export interface Subscribable {
  // new to talk with Yoni;
  subscribe(listener: RefSubscriber): Unsubscribe
}

export type FieldsRefBase<entityType> = {
  find(fieldMetadataOrKey: FieldMetadata | string): FieldRef<entityType, any>
  [Symbol.iterator]: () => IterableIterator<FieldRef<entityType, any>>
  toArray(): FieldRef<entityType, any>[]
}
export type FieldsMetadata<entityType> = {
  [Properties in keyof MembersOnly<entityType>]-?: FieldMetadata<
    entityType[Properties],
    entityType
  >
} & {
  find(
    fieldMetadataOrKey: FieldMetadata | string,
  ): FieldMetadata<unknown, entityType>
  [Symbol.iterator]: () => IterableIterator<FieldMetadata<any, entityType>>
  toArray(): FieldMetadata<any, entityType>[]
}

export type FieldsRef<entityType> = FieldsRefBase<entityType> & {
  [Properties in keyof MembersOnly<entityType>]-?: NonNullable<
    entityType[Properties]
  > extends {
    id?: number | string
  }
    ? IdFieldRef<entityType, entityType[Properties]>
    : FieldRef<entityType, entityType[Properties]>
}

export type FieldsRefForEntityBase<entityType> = FieldsRefBase<entityType> & {
  [Properties in keyof Omit<entityType, keyof EntityBase>]-?: NonNullable<
    entityType[Properties]
  > extends {
    id?: number | string
  }
    ? IdFieldRef<entityType, entityType[Properties]>
    : FieldRef<entityType, entityType[Properties]>
}

export type SortSegments<entityType> = {
  [Properties in keyof entityType]: SortSegment & { descending(): SortSegment }
}
export interface IdFieldRef<entityType, valueType>
  extends FieldRef<entityType, valueType> {
  setId(
    id: valueType extends { id?: number }
      ? number
      : valueType extends { id?: string }
      ? string
      : string | number,
  ): void
  getId(): valueType extends { id?: number }
    ? number
    : valueType extends { id?: string }
    ? string
    : string | number
}

export interface FieldRef<entityType = unknown, valueType = unknown>
  extends Subscribable {
  error: string | undefined
  displayValue: string
  value: valueType
  originalValue: valueType
  inputValue: string
  valueChanged(): boolean
  entityRef: EntityRef<entityType>
  container: entityType
  metadata: FieldMetadata<valueType>
  /**
   * Loads the related value - returns null if the related value is not found
   */
  load(): Promise<valueType>
  valueIsNull(): boolean
  originalValueIsNull(): boolean
  validate(): Promise<boolean>
}

export interface IdMetadata<entityType = unknown> {
  /** Extracts the id value of an entity item. Useful in cases where the id column is not called id
   * @example
   * repo.metadata.idMetadata.getId(task)
   */
  getId(item: Partial<MembersOnly<entityType>>): any
  field: FieldMetadata<any>
  fields: FieldMetadata<unknown>[]
  getIdFilter(...ids: any[]): EntityFilter<entityType>
  isIdField(col: FieldMetadata): boolean
  createIdInFilter(
    items: Partial<MembersOnly<entityType>>[],
  ): EntityFilter<entityType>
}

/** Metadata for an `Entity`, this metadata can be used in the user interface to provide a richer UI experience  */
export interface EntityMetadata<entityType = unknown> {
  /** The Entity's key also used as it's url  */
  readonly key: string
  /** Metadata for the Entity's fields */
  readonly fields: FieldsMetadata<entityType> //expose fields to repository
  /** A human readable caption for the entity. Can be used to achieve a consistent caption for a field throughout the app
   * @example
   * <h1>Create a new item in {taskRepo.metadata.caption}</h1>
   * @see {@link EntityOptions.caption}
   */
  readonly caption: string
  /** The name of the table in the database that holds the data for this entity.
   * If no name is set in the entity options, the `key` will be used instead.
   * @see {@link EntityOptions.dbName}
   */
  readonly dbName: string
  /** The options send to the `Entity`'s decorator
   * @see {@link EntityOptions}
   */
  readonly options: EntityOptions
  /** The class type of the entity */
  readonly entityType: ClassType<entityType>
  /** true if the current user is allowed to update an entity instance
   * @see {@link EntityOptions.allowApiUpdate
   * @example
   * const taskRepo = remult.repo(Task);
   * if (taskRepo.metadata.apiUpdateAllowed(task)){
   *   // Allow user to edit the entity
   * }
   */
  apiUpdateAllowed(item?: entityType): boolean
  /** true if the current user is allowed to read from entity
   * @see {@link EntityOptions.allowApiRead}
   * @example
   * const taskRepo = remult.repo(Task);
   * if (taskRepo.metadata.apiReadAllowed){
   *   await taskRepo.find()
   * }
   */
  readonly apiReadAllowed: boolean
  /** true if the current user is allowed to delete an entity instance
   * * @see {@link EntityOptions.allowApiDelete}
   * @example
   * const taskRepo = remult.repo(Task);
   * if (taskRepo.metadata.apiDeleteAllowed(task)){
   *   // display delete button
   * }
   */
  apiDeleteAllowed(item?: entityType): boolean
  /** true if the current user is allowed to create an entity instance
   * @see {@link EntityOptions.allowApiInsert}
   * @example
   * const taskRepo = remult.repo(Task);
   * if (taskRepo.metadata.apiInsertAllowed(task)){
   *   // display insert button
   * }
   */
  apiInsertAllowed(item?: entityType): boolean

  /**
   * @deprecated Returns the dbName - based on it's `dbName` option and it's `sqlExpression` option */
  getDbName(): Promise<string>
  /** Metadata for the Entity's id
   * @see {@link EntityOptions.id} for configuration
   *
   */
  readonly idMetadata: IdMetadata<entityType>
}

export declare type MembersOnly<T> = {
  [K in keyof Omit<T, keyof EntityBase> as T[K] extends Function
    ? never
    : K]: T[K]
}

export declare type DeepPartial<T> = T extends Record<PropertyKey, any>
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T

//Pick<
//   T,
//   { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
// >
export declare type idType<entityType> = entityType extends {
  id?: infer U
}
  ? U extends string
    ? string
    : U extends number
    ? number
    : string | number
  : string | number
/**used to perform CRUD operations on an `entityType` */
export interface Repository<entityType> {
  /** returns a result array based on the provided options */
  find(options?: FindOptions<entityType>): Promise<entityType[]>
  /** returns a result array based on the provided options */
  liveQuery(options?: FindOptions<entityType>): LiveQuery<entityType>
  /** returns the first item that matchers the `where` condition
   * @example
   * await taskRepo.findFirst({ completed:false })
   * @example
   * await taskRepo.findFirst({ completed:false },{ createIfNotFound: true })
   *      */
  findFirst(
    where?: EntityFilter<entityType>,
    options?: FindFirstOptions<entityType>,
  ): Promise<entityType | undefined>
  /** returns the first item that matchers the `where` condition
   * @example
   * await taskRepo.findOne({ where:{ completed:false }})
   * @example
   * await taskRepo.findFirst({ where:{ completed:false }, createIfNotFound: true })
   *      */
  findOne(
    options?: FindFirstOptions<entityType>,
  ): Promise<entityType | undefined>
  /** returns the items that matches the id. If id is undefined | null, returns null */
  findId(
    id: idType<entityType>,
    options?: FindFirstOptionsBase<entityType>,
  ): Promise<entityType | undefined | null>
  /**  An alternative form of fetching data from the API server, which is intended for operating on large numbers of entity objects.
   *
   * It also has it's own paging mechanism that can be used n paging scenarios.
   *
   * The `query` method doesn't return an array (as the `find` method) and instead returns an `iterable` `QueryResult` object
   * which supports iterations using the JavaScript `for await` statement.
   * @example
   * for await (const task of taskRepo.query()) {
   *   // do something.
   * }
   * @example
   * const query = taskRepo.query({
   *   where: { completed: false },
   *   pageSize: 100,
   * })
   * const count = await query.count()
   * console.log('Paged: ' + count / 100)
   * let paginator = await query.paginator()
   * console.log(paginator.items.length)
   * if (paginator.hasNextPage) {
   *   paginator = await paginator.nextPage()
   *   console.log(paginator.items.length)
   * }
   * */
  query(options?: QueryOptions<entityType>): QueryResult<entityType>
  /** Returns a count of the items matching the criteria.
   * @see [EntityFilter](http://remult.dev/docs/entityFilter.html)
   * @example
   * await taskRepo.count({ completed:false })
   */
  count(where?: EntityFilter<entityType>): Promise<number>

  /**Validates an item
   * @example
   * const error = repo.validate(task);
   * if (error){
   *   alert(error.message);
   *   alert(error.modelState.title);//shows the specific error for the title field
   * }
   * // Can also be used to validate specific fields
   * const error = repo.validate(task,"title")
   */
  validate(
    item: Partial<entityType>,
    ...fields: Extract<keyof MembersOnly<entityType>, string>[]
  ): Promise<ErrorInfo<entityType> | undefined>
  /** saves an item or item[] to the data source. It assumes that if an `id` value exists, it's an existing row - otherwise it's a new row
   * @example
   * await taskRepo.save({...task, completed:true })
   */

  save(item: Partial<MembersOnly<entityType>>[]): Promise<entityType[]>
  save(item: Partial<MembersOnly<entityType>>): Promise<entityType>

  /**Insert an item or item[] to the data source
   * @example
   * await taskRepo.insert({title:"task a"})
   * @example
   * await taskRepo.insert([{title:"task a"}, {title:"task b", completed:true }])
   */
  insert(item: Partial<MembersOnly<entityType>>[]): Promise<entityType[]>
  insert(item: Partial<MembersOnly<entityType>>): Promise<entityType>

  /**Insert an item to the data source including all one-to-one relations attached
   * @example
   * await userRepo.insert({
   *    name: "fellow",
   *    task: {
   *      title: "task a",
   *      completed: false
   *    }
   *})
   */
  insertWithRelations(
    item: DeepPartial<MembersOnly<entityType>>[],
  ): Promise<entityType[]>
  insertWithRelations(
    item: DeepPartial<MembersOnly<entityType>>,
  ): Promise<entityType>

  /** Updates an item, based on its `id`
   * @example
   * taskRepo.update(task.id,{...task,completed:true})
   */
  update(
    id: idType<entityType>,
    item: Partial<MembersOnly<entityType>>,
  ): Promise<entityType>
  update(
    id: Partial<MembersOnly<entityType>>,
    item: Partial<MembersOnly<entityType>>,
  ): Promise<entityType>
  /**
   * Updates all items that match the `where` condition.
   */
  updateMany(options: {
    where: EntityFilter<entityType>
    set: Partial<MembersOnly<entityType>>
  }): Promise<number>

  /** Deletes an Item*/
  delete(id: idType<entityType>): Promise<void>
  delete(item: Partial<MembersOnly<entityType>>): Promise<void>
  /**
   * Deletes all items that match the `where` condition.
   */
  deleteMany(options: { where: EntityFilter<entityType> }): Promise<number>

  /** Creates an instance of an item. It'll not be saved to the data source unless `save` or `insert` will be called for that item */
  create(item?: Partial<MembersOnly<entityType>>): entityType

  toJson(item: Promise<entityType[]>): Promise<any[]>
  toJson(item: entityType[]): any[]
  toJson(item: Promise<entityType>): Promise<any>
  toJson(item: entityType): any

  /** Translates a json object to an item instance */
  fromJson(x: any[], isNew?: boolean): entityType[]
  fromJson(x: any, isNew?: boolean): entityType
  /** returns an `entityRef` for an item returned by `create`, `find` etc... */
  getEntityRef(item: entityType): EntityRef<entityType>
  /** Provides information about the fields of the Repository's entity
   * @example
   * console.log(repo.fields.title.caption) // displays the caption of a specific field
   * console.log(repo.fields.title.options)// writes the options that were defined for this field
   */
  fields: FieldsMetadata<entityType>
  /**The metadata for the `entity`
   * @See [EntityMetadata](https://remult.dev/docs/ref_entitymetadata.html)
   */
  metadata: EntityMetadata<entityType>
  addEventListener(listener: entityEventListener<entityType>): Unsubscribe
  relations(item: entityType): RepositoryRelations<entityType>
}
/**
 * The `LiveQuery` interface represents a live query that allows subscribing to changes in the query results.
 *
 * @template entityType The entity type for the live query.
 */
export interface LiveQuery<entityType> {
  /**
   * Subscribes to changes in the live query results.
   *
   * @param {(info: LiveQueryChangeInfo<entityType>) => void} next A function that will be called with information about changes in the query results.
   * @returns {Unsubscribe} A function that can be used to unsubscribe from the live query.
   *
   * @example
   * // Subscribing to changes in a live query
   * const unsubscribe = taskRepo
   *   .liveQuery({
   *     limit: 20,
   *     orderBy: { createdAt: 'asc' }
   *     //where: { completed: true },
   *   })
   *   .subscribe(info => setTasks(info.applyChanges));
   *
   * // Later, to unsubscribe
   * unsubscribe();
   */
  subscribe(next: (info: LiveQueryChangeInfo<entityType>) => void): Unsubscribe

  /**
   * Subscribes to changes in the live query results using a `SubscriptionListener` object.
   *
   * @param {Partial<SubscriptionListener<LiveQueryChangeInfo<entityType>>>} listener An object that implements the `SubscriptionListener` interface.
   * @returns {Unsubscribe} A function that can be used to unsubscribe from the live query.
   */
  subscribe(
    listener: Partial<SubscriptionListener<LiveQueryChangeInfo<entityType>>>,
  ): Unsubscribe
}
/**
 * The `LiveQueryChangeInfo` interface represents information about changes in the results of a live query.
 *
 * @template entityType The entity type for the live query.
 */
export interface LiveQueryChangeInfo<entityType> {
  /**
   * The updated array of result items.
   *
   * @type {entityType[]}
   */
  items: entityType[]

  /**
   * The changes received in the specific message. The change types can be "all" (replace all), "add", "replace", or "remove".
   *
   * @type {LiveQueryChange[]}
   */
  changes: LiveQueryChange[]

  /**
   * Applies the changes received in the message to an existing array. This method is particularly useful with React
   * to update the component's state based on the live query changes.
   *
   * @param {entityType[] | undefined} prevState The previous state of the array of result items.
   * @returns {entityType[]} The updated array of result items after applying the changes.
   *
   * @example
   * // Using applyChanges in a React component with useEffect hook
   * useEffect(() => {
   *   return taskRepo
   *     .liveQuery({
   *       limit: 20,
   *       orderBy: { createdAt: 'asc' }
   *       //where: { completed: true },
   *     })
   *     .subscribe(info => setTasks(info.applyChanges));
   * }, []);
   */
  applyChanges(prevState: entityType[] | undefined): entityType[]
}
export interface FindOptions<entityType> extends FindOptionsBase<entityType> {
  /** Determines the number of rows returned by the request, on the browser the default is 100 rows
   * @example
   * await this.remult.repo(Products).find({
   *  limit:10,
   *  page:2
   * })
   */
  limit?: number
  /** Determines the page number that will be used to extract the data
   * @example
   * await this.remult.repo(Products).find({
   *  limit:10,
   *  page:2
   * })
   */
  page?: number
}
/** Determines the order of items returned .
 * @example
 * await this.remult.repo(Products).find({ orderBy: { name: "asc" }})
 * @example
 * await this.remult.repo(Products).find({ orderBy: { price: "desc", name: "asc" }})
 */
export declare type EntityOrderBy<entityType> = {
  [Properties in keyof Partial<MembersOnly<entityType>>]?: 'asc' | 'desc'
}

/**Used to filter the desired result set
 * @see [EntityFilter](http://remult.dev/docs/entityFilter.html)
 */
export declare type EntityFilter<entityType> = {
  [Properties in keyof Partial<MembersOnly<entityType>>]?:
    | (Partial<entityType>[Properties] extends number | Date | undefined
        ? ComparisonValueFilter<Partial<entityType>[Properties]>
        : Partial<entityType>[Properties] extends string | undefined
        ?
            | Partial<entityType>[Properties]
            | (ContainsStringValueFilter &
                ComparisonValueFilter<Partial<entityType>[Properties]>)
        : Partial<entityType>[Properties] extends boolean | undefined
        ? ValueFilter<boolean>
        : Partial<entityType>[Properties] extends
            | { id?: string | number }
            | undefined
        ? IdFilter<Partial<entityType>[Properties]>
        : ValueFilter<Partial<entityType>[Properties]>)
    | ContainsStringValueFilter
} & {
  /**
   * Represents an 'OR' filter condition where any of the specified filters can be true.
   *
   * @example
   * // Matches entities where the status is 1 or the archive is false
   * const filter = {
   *   $or: [
   *     { status: 1 },
   *     { archive: false }
   *   ]
   * };
   */
  $or?: EntityFilter<entityType>[]

  /**
   * Represents an 'AND' filter condition where all of the specified filters must be true.
   *
   * @example
   * // Matches entities where the status is 1 and the archive is false
   * const filter = {
   *   $and: [
   *     { status: 1 },
   *     { archive: false }
   *   ]
   * };
   */
  $and?: EntityFilter<entityType>[]

  /**
   * Represents a 'NOT' filter condition where the specified filter must be false.
   *
   * @example
   * // Matches entities where the status is not 1
   * const filter = {
   *   $not: { status: 1 }
   * };
   */
  $not?: EntityFilter<entityType>
}

export type ValueFilter<valueType> =
  | valueType
  | valueType[]
  | {
      /**
       * Represents a 'NOT EQUAL' filter condition where the value must not match the specified value or values.
       *
       * @example
       * // Matches entities where the status is not 1
       * const filter = {
       *   status: { $ne: 1 }
       * };
       *
       * @example
       * // Matches entities where the status is not 1, 2, or 3
       * const filter = {
       *   status: { $ne: [1, 2, 3] }
       * };
       */
      $ne?: valueType | valueType[]

      /**
       * Represents a 'NOT EQUAL' filter condition using the '!=' operator where the value must not match the specified value or values.
       *
       * @example
       * // Matches entities where the status is not 1
       * const filter = {
       *   status: { '!=': 1 }
       * };
       *
       * @example
       * // Matches entities where the status is not 1, 2, or 3
       * const filter = {
       *   status: { '!=': [1, 2, 3] }
       * };
       */
      '!='?: valueType | valueType[]

      /**
       * Represents an 'IN' filter condition where the value must match one of the specified values.
       *
       * @example
       * // Matches entities where the status is 1, 3, or 5
       * const filter = {
       *   status: { $in: [1, 3, 5] }
       * };
       */
      $in?: valueType[]

      /**
       * Represents a 'NOT IN' filter condition where the value must not match any of the specified values.
       *
       * @example
       * // Matches entities where the status is not 1, 2, or 3
       * const filter = {
       *   status: { $nin: [1, 2, 3] }
       * };
       */
      $nin?: valueType[]
    }
export type ComparisonValueFilter<valueType> = ValueFilter<valueType> & {
  /**
   * Represents a 'GREATER THAN' filter condition where the value must be greater than the specified value.
   *
   * @example
   * // Matches entities where the status is greater than 1
   * const filter = {
   *   status: { $gt: 1 }
   * };
   */
  $gt?: valueType

  /**
   * Represents a 'GREATER THAN' filter condition using the '>' operator where the value must be greater than the specified value.
   *
   * @example
   * // Matches entities where the status is greater than 1
   * const filter = {
   *   status: { '>': 1 }
   * };
   */
  '>'?: valueType

  /**
   * Represents a 'GREATER THAN OR EQUAL TO' filter condition where the value must be greater than or equal to the specified value.
   *
   * @example
   * // Matches entities where the status is greater than or equal to 1
   * const filter = {
   *   status: { $gte: 1 }
   * };
   */
  $gte?: valueType

  /**
   * Represents a 'GREATER THAN OR EQUAL TO' filter condition using the '>=' operator where the value must be greater than or equal to the specified value.
   *
   * @example
   * // Matches entities where the status is greater than or equal to 1
   * const filter = {
   *   status: { '>=': 1 }
   * };
   */
  '>='?: valueType

  /**
   * Represents a 'LESS THAN' filter condition where the value must be less than the specified value.
   *
   * @example
   * // Matches entities where the status is less than 1
   * const filter = {
   *   status: { $lt: 1 }
   * };
   */
  $lt?: valueType

  /**
   * Represents a 'LESS THAN' filter condition using the '<' operator where the value must be less than the specified value.
   *
   * @example
   * // Matches entities where the status is less than 1
   * const filter = {
   *   status: { '<': 1 }
   * };
   */
  '<'?: valueType

  /**
   * Represents a 'LESS THAN OR EQUAL TO' filter condition where the value must be less than or equal to the specified value.
   *
   * @example
   * // Matches entities where the status is less than or equal to 1
   * const filter = {
   *   status: { $lte: 1 }
   * };
   */
  $lte?: valueType

  /**
   * Represents a 'LESS THAN OR EQUAL TO' filter condition using the '<=' operator where the value must be less than or equal to the specified value.
   *
   * @example
   * // Matches entities where the status is less than or equal to 1
   * const filter = {
   *   status: { '<=': 1 }
   * };
   */
  '<='?: valueType
}
export interface ContainsStringValueFilter {
  /**
   * Represents a 'CONTAINS' filter condition where the value must contain the specified substring.
   *
   * @example
   * // Matches entities where the name contains 'joe'
   * const filter = {
   *   name: { $contains: 'joe' }
   * };
   */
  $contains?: string

  /**
   * Represents a 'NOT CONTAINS' filter condition where the value must not contain the specified substring.
   *
   * @example
   * // Matches entities where the name does not contain 'joe'
   * const filter = {
   *   name: { $notContains: 'joe' }
   * };
   */
  $notContains?: string

  /**
   * Represents a 'STARTS WITH' filter condition where the value must start with the specified substring.
   *
   * @example
   * // Matches entities where the name starts with 'joe'
   * const filter = {
   *   name: { $startsWith: 'joe' }
   * };
   */
  $startsWith?: string

  /**
   * Represents an 'ENDS WITH' filter condition where the value must end with the specified substring.
   *
   * @example
   * // Matches entities where the name ends with 'joe'
   * const filter = {
   *   name: { $endsWith: 'joe' }
   * };
   */
  $endsWith?: string
}
export type IdFilter<valueType> =
  | ValueFilter<valueType>
  | {
      $id: ValueFilter<valueType extends { id?: number } ? number : string>
    }

export interface LoadOptions<entityType> {
  /**
   * @deprecated The 'load' option is deprecated and will be removed in future versions.
   * Use 'Relations.toOne' along with the 'include' option instead.
   *
   * Example usage:
   * ```
   * // Deprecated usage with 'load' option
   * await remult.repo(Order).find({
   *   load: (o) => [o.customer],
   * });
   *
   *
   * // Preferred usage with 'Relations.toOne' and 'include' option
   * await remult.repo(Order).find({
   *   include: { customer: true },
   * });
   * ```
   */
  load?: (entity: FieldsMetadata<entityType>) => FieldMetadata[]
  /**
   * An option used in the `find` and `findFirst` methods to specify which related entities should be included
   * when querying the source entity. It allows you to eagerly load related data to avoid N+1 query problems.
   *
   * @param include An object specifying the related entities to include, their options, and filtering criteria.
   *
   * Example usage:
   * ```
   * const orders = await customerRepo.find({
   *   include: {
   *     // Include the 'tags' relation for each customer.
   *     tags: true,
   *   },
   * });
   * ```
   * In this example, the `tags` relation for each customer will be loaded and included in the query result.
   *
   * @see {@link Relations.toMany}
   * @see {@link Relations.toOne}
   * @see {@link RelationOptions}
   */
  include?: MembersToInclude<entityType>
}
export interface FindOptionsBase<entityType> extends LoadOptions<entityType> {
  /** filters the data
   * @example
   * await taskRepo.find({where: { completed:false }})
   * @see For more usage examples see [EntityFilter](https://remult.dev/docs/entityFilter.html)
   */
  where?: EntityFilter<entityType>
  /** Determines the order of items returned .
   * @example
   * await this.remult.repo(Products).find({ orderBy: { name: "asc" }})
   * @example
   * await this.remult.repo(Products).find({ orderBy: { price: "desc", name: "asc" }})
   */
  orderBy?: EntityOrderBy<entityType>
}
export interface FindFirstOptions<entityType>
  extends FindOptionsBase<entityType>,
    FindFirstOptionsBase<entityType> {}
export interface FindFirstOptionsBase<entityType>
  extends LoadOptions<entityType> {
  /** determines if to cache the result, and return the results from cache.
   */
  useCache?: boolean
  /** If set to true and an item is not found, it's created and returned*/
  createIfNotFound?: boolean
}
export interface QueryOptions<entityType> extends FindOptionsBase<entityType> {
  /** The number of items to return in each step */
  pageSize?: number
  /** A callback method to indicate the progress of the iteration */
  progress?: { progress: (progress: number) => void }
}
/** The result of a call to the `query` method in the `Repository` object.
 */
export interface QueryResult<entityType> {
  /** returns an iterator that iterates the rows in the result using a paging mechanism
   * @example
   * for await (const task of taskRepo.query()) {
   *   await taskRepo.save({ ...task, completed });
   * }
   */
  [Symbol.asyncIterator](): {
    next: () => Promise<IteratorResult<entityType, entityType>>
  }
  /** returns the number of rows that match the query criteria */
  count(): Promise<number>
  /** Returns a `Paginator` object that is used for efficient paging */
  paginator(): Promise<Paginator<entityType>>
  /** gets the items in a specific page */
  getPage(pageNumber?: number): Promise<entityType[]>
  /** Performs an operation on all the items matching the query criteria */
  forEach(what: (item: entityType) => Promise<any>): Promise<number>
}
/** An interface used to paginating using the `query` method in the `Repository` object
 *  @example
 * @example
 * const query = taskRepo.query({
 *   where: { completed: false },
 *   pageSize: 100,
 * })
 * const count = await query.count()
 * console.log('Paged: ' + count / 100)
 * let paginator = await query.paginator()
 * console.log(paginator.items.length)
 * if (paginator.hasNextPage) {
 *   paginator = await paginator.nextPage()
 *   console.log(paginator.items.length)
 * }
 */
export interface Paginator<entityType> {
  /** the items in the current page */
  items: entityType[]
  /** True if next page exists */
  hasNextPage: boolean
  /** Gets the next page in the `query`'s result set */
  nextPage(): Promise<Paginator<entityType>>
  /** the count of the total items in the `query`'s result */
  count(): Promise<number>
}

/**
 * Options for configuring a relation between entities.
 *
 * @template fromEntity The type of the source entity (the entity defining the relation).
 * @template toEntity The type of the target entity (the related entity).
 * @template matchIdEntity The type used for matching IDs in the relation.
 * @template optionsType The type of find options to apply to the relation (default is FindOptionsBase<toEntity>).
 */

export interface RelationOptions<
  fromEntity,
  toEntity,
  matchIdEntity,
  optionsType extends FindOptionsBase<toEntity> = FindOptionsBase<toEntity>,
> extends Pick<FieldOptions, 'caption'> {
  /**
   * An object specifying custom field names for the relation.
   * Each key represents a field in the related entity, and its value is the corresponding field in the source entity.
   * For example, `{ customerId: 'id' }` maps the 'customerId' field in the related entity to the 'id' field in the source entity.
   * This is useful when you want to define custom field mappings for the relation.
   */
  //[ ] V2- consider enforcing types
  fields?: {
    [K in keyof toEntity]?: keyof fromEntity & string
  }
  /**
   * The name of the field for this relation.
   */
  field?: keyof matchIdEntity & string
  /**
   * Find options to apply to the relation when fetching related entities.
   * You can specify a predefined set of find options or provide a function that takes the source entity
   * and returns find options dynamically.
   * These options allow you to customize how related entities are retrieved.
   */
  findOptions?: optionsType | ((entity: fromEntity) => optionsType)
  /**
   * Determines whether the relation should be included by default when querying the source entity.
   * When set to true, related entities will be automatically included when querying the source entity.
   * If false or not specified, related entities will need to be explicitly included using the `include` option.
   */
  defaultIncluded?: boolean
}

export type ObjectMembersOnly<T> = MembersOnly<{
  [K in keyof Pick<
    T,
    {
      [K in keyof T]: T[K] extends object | undefined | null
        ? T[K] extends Date | undefined | null
          ? never
          : K
        : never
    }[keyof T]
  >]: T[K]
}>

export type MembersToInclude<T> = {
  [K in keyof ObjectMembersOnly<T>]?:
    | boolean
    | (NonNullable<T[K]> extends Array<any>
        ? FindOptions<NonNullable<T[K]>[number]>
        : FindFirstOptions<NonNullable<T[K]>>)
}

export type RepositoryRelations<entityType> = {
  [K in keyof ObjectMembersOnly<entityType>]-?: NonNullable<
    entityType[K]
  > extends Array<infer R>
    ? Repository<R>
    : entityType[K] extends infer R
    ? { findOne: (options?: FindOptionsBase<R>) => Promise<R> }
    : never
}

export type RepositoryRelationsForEntityBase<entityType> = {
  [K in keyof Omit<entityType, keyof EntityBase>]-?: NonNullable<
    entityType[K]
  > extends Array<infer R>
    ? Repository<R>
    : entityType[K] extends infer R
    ? { findOne: (options?: FindOptionsBase<R>) => Promise<R> }
    : never
}

export declare type EntityIdFields<entityType> = {
  [Properties in keyof Partial<MembersOnly<entityType>>]?: true
}

export interface ClassFieldDecoratorContextStub<entityType, valueType> {
  readonly access: {
    set(object: entityType, value: valueType): void
  }
  readonly name: string
}
export interface ClassDecoratorContextStub<
  Class extends new (...args: any) => any = new (...args: any) => any,
> {
  readonly kind: 'class'
  readonly name: string | undefined
  addInitializer(initializer: (this: Class) => void): void
}

export type ClassFieldDecorator<entityType, valueType> = (
  target: any,
  context:
    | string
    | ClassFieldDecoratorContextStub<entityType, valueType | undefined>,
  c?: any,
) => void

export const flags = {
  error500RetryCount: 4,
}
//p1 - add transactional option to backend method
//p1 - add parameter all to deleteMany, and updateMany
//p1  filter.apply ApiPreFilter
//p1 - min, max, avg, sum, countDistinct - noam come up with an api

/*p1 - add id and use uuid by default, but allow changes with Fields.id.defaultIdProvider NO but defaultProvider yes???
  //p1 - replace uuid with crypto.randomUUID and allow custom fallback NO
  //p1 - Add example for luid
  //p1 - add example for nanoid
  //p1 - explain the benefits of changing the default provider for testing in docs.
*/
//p1 - consider upsert (where,set)
//p1 TODO - consider id to also support keyof (id:['company','index']) - had problem with | (keyof Partial<entityType>)[] & `entity`

//p2 - add some kind of options handler that will help with translation etc... like in hagai - something that runs at the stage where options are being built

/*y1 - https://github.com/remult/remult/discussions/438
     - https://github.com/remult/remult/blob/query-argumets/projects/tests/dbs/test-sql-database.spec.ts#L100-L128
     //y1 - consider sql expression gets a dbnames of it's own (that already has the "tableName" defined correctly) maybe also the filter translator
     //p2 - allow preprocess to replace filter values - for example replace $contains on a specific field, with specific other sql - useful for full text search and other scenarios
     //y2 - soft-delete-discussion https://discord.com/channels/975754286384418847/1230386433093533698/1230386433093533698
*/
//p2 - fix query docs to also explain how it can be used for infinite scroll and pagination.
//p2 - when like doesn't have a string - don't send it to the db

//p1 - vite 5.3 supports ts5 decorators - check and adapt.
//p1 - tutorial about controller - and mutable controller
//p1 - docs abount subscription channel

//p1 - Consider enforcing serial operations on JSON database to prevent data loss
//p1 - fix sqlite to  support alter table when adding a column with ensure schema = on
//p1 - add LifecycleEvent to documentation
//p1 - fix chaining of saving and saved in multiple entity options args
//p1 - review starter and examples and separate remult * auth from the routes
//y1 - live query with count #436

//y1 TODO - In the esm version of our tutorial - the imports are automatically .ts and not .js in react and not in vue

//y1 TODO - fix remult admin not to load the html into memory until used

//y2 - talk about insert / update / delete with relations
/*
repo(Order).insert({},{
  relations:{
    orderItems:[{},{},{}]
  }
})
*/
//y2 - repo batch - for multiple operations:
/*
const result = await repo.batch(x=>({
  data:x.find(),
  count:x.count()
}))
*/

//y1 - wait a second to close stream -see pr

//p1 - prepare the createEntity discussion

//p1 - article on displayValue including it's definition for entities that is used in relations
//p1 - article auth.js with express - played with it, requires type="module" and a few more configurations - https://github.com/noam-honig/express-auth

//p2 - create foreign key constraints in user code - https://codesandbox.io/p/devbox/fk-validator-tdshcs

//y2 - should we validate relations

//y1 - dependency of live query tables  live query refresh of view on table update
//p1 - see why mongo tests do not run anymore

//y2 - consider replacing all errors with error classes that extend the base Error class
//y2 - should enforce integer - currently we probably round / truncate it
//y1 - talk about filter on objects that are not loaded -  {
//category: repo(CompoundId).create({ company: 7, index: 3, name: '' }),
//    }
/*y1 - talk about modules in init express with entities/controllers,initRequest,initApi
 - support get with backend method, with url search params as the first parameter, & url as second parameter
   - support returning redirect, and plain html (For sign in scenarios)

 */

//p1 - in this video I'll use remult to turn a frontend app to a fullstack app

/*y2 - Talk JYC - JYC - add some integrity checks on delete
  - soft delete
  - delete restrict (implicit, or user selected - and if so, how) (delete & update of id)

*/

//y1 - talk about the parameter issue with backend methods

//y2 - livequery for findfirst (@JY)

/*y2 -
//y2 - allow api update only for new rows
  @Fields.string<Category>({
    allowApiUpdate: (c) => getEntityRef(c).isNew(),
  })
  Description = ""*/
//y2 - get backend methods to work when specifying types for date, and entities as poco's
//y2 - constraints (@JY)

//p1 - when a tasks table exists in a different schema - we get many errors
//p1 - live query with include

//p1 - adjust angular tutorial starter kit for latest angular (as is in tutorial)

//y2 - Fix problem with promise all in sql expression recurssion - when using PromiseAll in row relation loading, some sql expressions appear is recursion call even if they are not
//p2 - when subscribe is forbidden - the query still runs after the renew process
//p2 - 'update tasks set  where id = $1

//y2 - remove __dirname from tutorials
//p2 - when value changes for field with error, clear error - so the user will feel comfortable
//p2 - allowApiUpdate should be false for include in api false

//docs

//------
//y2 - wrap identifier for custom filter & sql expression
//y2 - Should we create a separate implementation of command - one that the user uses, and another that the database implements (with only the bear necesities) - for example, to provide a second paramter called field for toDb conversions
//y2 - should we simply inherit from SqlDataProvider - and send the required parameter in the call to the base class - I think that new SqlDatabase(new PostgresDataProvider()) is a bilt combersome
//y2 - from the crm-demo(https://crm-demo.up.railway.app/deals), after editing a deal: - _updateEntityBasedOnApi

//y1 - Backend methods are transactions, it's not intuitive and maybe should be optional / opt in (https://github.com/remult/remult/issues/466)
//y1 - how to run a transaction as a user

//y2 - message for relation that is missing
//y2 - consider multi tenancies

//p2 - and validators to reference
//y2 - discuss a default date formatter
//y2 - add some api testing framework for user unit tests (will help with codesandbox based discussions)

//[ ] V2 - what to do about for relations count?
//[ ] V2 - condition? not to fetch if null etc....
