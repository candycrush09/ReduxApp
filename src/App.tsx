import { useState, useEffect } from 'react'
import './App.css';

import {useStore, FilmType} from './store';

function App() {
  const { listFilms, getFilms, getFilm } = useStore();
  const store = useStore();
  console.log("store: ", store)
  const [filmDetail, setFilm] = useState<FilmType>({})

  const onClickDetail = async (id: string) => {
    const fDetail = await getFilm(id);
    setFilm(fDetail as any);
    
  }

  useEffect(() =>{
    getFilms()
  }, [])

  console.log("listFilms", listFilms);
  

  return (
    <div className="App">
      {listFilms.map((fil: any) => <div onClick={() => onClickDetail(fil.id || '')}>{fil.title}</div>)}
      <br/>
      {!!filmDetail?.id &&<div>
        <img src={filmDetail.image}/>
      </div>}
    </div>
  )
}

export default App
