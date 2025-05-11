import { useState } from 'react';

interface MinisterFormFields {
  name: string;
  info: string;
}

function App() {
  const [queryBody, setQueryBody] = useState<{ action: string } | null>(null);
  const [result, setResult] = useState(null);
  const [ministerformFields, setMinisterFormFields] = useState<MinisterFormFields>({
    info: 'Senior Pastor Springs of Hope Christian Ministries',
    name: 'Pastor Mrs. Grace Lasisi',
  });

  const [showslidecontrols, setShowSlideControls] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const 
    setQueryBody({"action": 'next_slide'});

    const res = await fetch('/fs-api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryBody }),
    });

    const data = await res.json();
    setResult(data);
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();
    const res = await fetch('/fs-api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: e.target.value }),
    });
    const data = await res.json();
    console.log('Button clicked' + e.target.value);
    console.log(data);
  }

  const handleMinisterUpdate = (e) => {
    e.preventDefault();

    console.log('Minister Update');
    console.log(ministerformFields);
    
    const ministerformFields_ = {
      name: 'current_minister_info',
      value: 'Grace',
    };

    const res = fetch('/fs-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({action: 'change_variable', data: ministerformFields_ })
      body: JSON.stringify({action: 'change_variable', ...ministerformFields_ })
      // body: JSON.stringify({action: 'next_slide', data: ministerformFields_ })
      // body: JSON.stringify({action: 'change_variable', data : ministerformFields_ })
    });

    res.then((response) => {
      if (response.ok) {
        console.log('Minister updated successfully');
      } else {
        console.error('Error updating minister');
      }
    }
    ).catch((error) => {
      console.error('Error:', error);
    })

  }; 
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1 className='text-3xl'>FreeShows Search</h1>
      <h2 className='text-2xl'>Slide Controls</h2>
      <p className='mb-4'>
        Todays Service: {}
      </p>
      <form onSubmit={handleMinisterUpdate}>
        <div className='flex flex-col justify-start'>
          <label className='mt-4 mb-2 text-sm'>Current Minister Info</label>
          <div className='mb-4 flex'>
            <input
              type="text"
              value={queryBody}
              name="current_minister_info"
              className='border-2 border-gray-300 rounded p-1 mr-2 text-sm'
              onChange={(e) => setMinisterFormFields((_miniter_form: MinisterFormFields)=> {
                _miniter_form['info'] = e.target.value,
                _miniter_form['name'] = ministerformFields.name;
                console.log('Minister Info');
                console.log(_miniter_form); 
              
                return _miniter_form;
              })}
              placeholder="Minister Info"
              />
            <input
              type="text"
              name="current_minister_name"
              className='border-2 border-gray-300 rounded p-1 mr-2 text-sm'
              onChange={(e) => setMinisterFormFields((_miniter_form: MinisterFormFields)=> {
                _miniter_form['info'] = ministerformFields.info,
                _miniter_form['name'] = e.target.value;
                console.log('Minister Info');
                console.log(_miniter_form); 

                return _miniter_form;
              })}
              placeholder="Minister Name"
            />
            <button type="submit" className='bg-gray-500 rounded text-white px-4 py-1 mr-2 hover:bg-blue-700 cursor-pointer'>Submit</button>
            <button type="submit" className='bg-red-300 rounded text-white px-4 py-1 hover:bg-blue-700 cursor-pointer'>Clear</button>
          </div>
        </div>
      </form>
      
      <div className='flex items-center justify-between fixed bottom-0 right-0 p-2 text-gray-100 text-sm border-t-cyan-100 w-full bg-gray-900'>
        { showslidecontrols ? (<div className='flex'>
          <button
            onClick={()=> {setShowSlideControls(true)}}
            className='bg-gray-500 hover:bg-blue-700 text-black hover:text-white font-bold py-1 px-2 rounded cursor-pointer mr-2'
            >
            <span>&lt;</span><span className='hidden md:hidden'>Hide Controls</span>
          </button>
          <button
            onClick={handleButtonClick}
            className='bg-red-500 hover:bg-blue-700 text-black hover:text-white font-bold py-1 px-2 rounded cursor-pointer mr-2'
            value={'previous_slide'}
            >
            Previous Slide
          </button>
          <button
            onClick={handleButtonClick}
            className='bg-green-500 hover:bg-blue-700 text-black hover:text-white font-bold py-1 px-2 rounded cursor-pointer'
            value={'next_slide'}
            >
            Next Slide
          </button>
        </div>) : <>
          <button onClick={()=> {setShowSlideControls(true)}}>
            <span className='text-sm text-gray-400'>Show Slide Controls</span>
          </button>
          </>
        }
        <p className=''>
          <strong>Minister Info:</strong> {JSON.stringify(ministerformFields)}
        </p>
          
      </div>

      {result && (
        <pre style={{ marginTop: '1rem' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
