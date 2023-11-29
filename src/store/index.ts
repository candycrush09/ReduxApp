import create, { State, GetState, SetState, StoreApi, StateCreator } from 'zustand';
import { Draft, produce } from 'immer'
import { combine } from 'zustand/middleware';

const log = <
    T extends State,
    CustomSetState extends SetState<T>,
    CustomGetState extends GetState<T>,
    CustomStoreApi extends StoreApi<T>
    >(
    config: StateCreator<
      T,
      (partial: ((draft: Draft<T>) => void) | T, replace?: boolean) => void,
      CustomGetState,
      CustomStoreApi
    >
): StateCreator<T, CustomSetState, CustomGetState, CustomStoreApi> =>
(set, get, api)  => config((args) => {
    console.log("  applying", args)
    set(args)
    console.log("  new state", get())
  }, get, api)

  // Turn the set method into an immer proxy
  const immer =
  <
    T extends State,
    CustomSetState extends SetState<T>,
    CustomGetState extends GetState<T>,
    CustomStoreApi extends StoreApi<T>
  >(
    config: StateCreator<
      T,
      (partial: ((draft: Draft<T>) => void) | T, replace?: boolean) => void,
      CustomGetState,
      CustomStoreApi
    >
  ): StateCreator<T, CustomSetState, CustomGetState, CustomStoreApi> =>
  (set, get, api) =>
    config(
      (partial, replace) => {
        const nextState =
          typeof partial === 'function'
            ? produce(partial as (state: Draft<T>) => T)
            : (partial as T)
        return set(nextState, replace)
      },
      get,
      api
    )

export interface FilmType {
    id?: string;
    title?: string;
    original_title?: string;
    image?: string;
    description?: string;
}

interface FilmStore  {
    listFilms: FilmType[],
    filmDetail?: FilmType,
    getFilms: () => void,
    getFilm: (id: string) => void
}

interface UserStore {
    listUsers: FilmType[]
}

export const usePostStore  = (set: SetState<FilmStore & UserStore>, get: GetState<FilmStore & UserStore>) => ({
    listFilms: [],
    filmDetail: {},
    getFilms: async () => {
        const response = await fetch("https://ghibliapi.herokuapp.com/films")
        set({ listFilms: await response.json() })
      },
    getFilm: async (id: string) => {
        const response = await fetch(`https://ghibliapi.herokuapp.com/films/${id}`);
        console.log("get", get().listFilms);
        
        return await response.json();
        // set({ filmDetail: await response.json() })
      }
}) as FilmStore;

export const useUserStore = (set: SetState<UserStore & FilmStore>, get: GetState<FilmStore & UserStore>) => ({
    listUsers: [],
    listFilms: [{}]
})

export const useStore = create<any> ( 
    log(
        immer( 
            (set, get) => ({
                ...usePostStore(set, get),
                ...useUserStore(set, get),
            }),
        ))
  )

