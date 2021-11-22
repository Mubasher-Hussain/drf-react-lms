import React from "react";

import axios from "../auth/axiosConfig";

export function SelectColumnFilter({
    column: { filterValue, setFilter, id },
  }) {
    const [optionsList, setOptionsList] = React.useState();
    let url ;
    if (id=='author'){
      url = '../server/api/authors'
    }
    else if (id=='category'){
      url = '../server/api/books/categories'
    }
    
    React.useEffect(() =>{
    if (url)
      axios
      .get(url)
      .then(res =>setOptionsList(id=='author' ? res.data : res.data.categories))
    else
      setOptionsList(['pending', 'accepted', 'rejected'])
    
    }, [])
    
    const options = React.useMemo(() => {
      const options = new Set()
      if (optionsList && optionsList.length){
        optionsList.map((option) => options.add(id=='author' ? option.name : option))
      }
      return [...options.values()]
    }, [optionsList])
  
    return (
      <select
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined)
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }