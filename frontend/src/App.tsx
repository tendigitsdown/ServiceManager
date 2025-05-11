import { use, useEffect, useState } from 'react';

interface MinisterFormFields {
  name: string;
  info: string;
}

function App() {
  const [ministerformFields, setMinisterFormFields] = useState<MinisterFormFields>({
    info: 'Senior Pastor Springs of Hope Christian Ministries',
    name: 'Pastor Mrs. Grace Lasisi',
  });
  const [currentOutput, setCurrentOutput] = useState('');

  const [showslidecontrols, setShowSlideControls] = useState(true);

  const getDynamicValue = async (dynamic_value: string) => {
    const res = await fetch('/fs-api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_dynamic_value', value: dynamic_value }),
    });

    const data = await res;
    // setResult(data);
    console.log('Dynamic Value');
    console.log(data.text());
    return data;
  }

  useEffect(() => {
    // Call the function to get the dynamic values
    getDynamicValue('current_minister_info');
    getDynamicValue('current_minister_name');
  }
  , []);



  const getCurrentSlideInfo = async () => {
    // Retrieve the current slide name and text from 2 separate API calls and return both
    const resp_slide_text = await fetch('/fs-api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_output_slide_text' }),
    })


    const data = await resp_slide_text.json();
    console.log('Current Slide Info');
    console.log(data.data);
    setCurrentOutput(data.data);
    return;
  };

  const handleButtonClick = async (button_value: string) => {
    // e.preventDefault();
    // e.target.classList.add('bg-gray-900 border-2 border-amber-300');
    const res = await fetch('/fs-api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: button_value }),
    })
    
    const data = await res;
    console.log('Button Click');
    console.log(data);
    getCurrentSlideInfo();
    return
  }

  const handleMinisterUpdate = (e: React.FormEvent<HTMLFormElement>) => {
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
      body: JSON.stringify({ action: 'change_variable', data: ministerformFields_ })
      // body: JSON.stringify({ action: 'change_variable', ...ministerformFields_ })
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

  useEffect(() => {
    // Call the function to get the current slide info
    getCurrentSlideInfo();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className='text-3xl'>Service Manager</h1>
      <h2 className='text-md'>Today: {'Sunday Service'}</h2>
      <p className='text-sm mt-1'>
        <span className='mr-2'><span className='text-gray-400'>Current Event: </span><span className='font-bold'>{'Cast your burdens'}</span></span>
        <span className='mr-2'><span className='text-gray-400'>Next Event: </span><span className='font-bold'>{'Praise and Worship'}</span></span>
      </p>
      <form onSubmit={handleMinisterUpdate}>
        <div className='flex flex-col justify-start'>
          <label className='mt-4 mb-2 text-sm'>Current Minister Info</label>
          <div className='mb-4 flex'>
            <input
              type="text"
              value={ministerformFields.info}
              name="current_minister_info"
              className='border-2 border-gray-300 rounded p-1 mr-2 text-sm'
              onChange={(e) => setMinisterFormFields((_miniter_form: MinisterFormFields) => {
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
              value={ministerformFields.name}
              className='border-2 border-gray-300 rounded p-1 mr-2 text-sm'
              onChange={(e) => setMinisterFormFields((_miniter_form: MinisterFormFields) => {
                _miniter_form['info'] = ministerformFields.info,
                  _miniter_form['name'] = e.target.value;
                console.log('Minister Info');
                console.log(_miniter_form);

                return _miniter_form;
              })}
              placeholder="Minister Name"
            />
            <button type="submit" className='bg-gray-500 rounded text-white px-4 py-1 mr-2 hover:bg-blue-700 cursor-pointer'>Submit</button>
            <button type="submit" className='bg-red-400 rounded text-white px-4 py-1 hover:bg-blue-700 cursor-pointer'>Clear</button>
          </div>
        </div>
      </form>

      <div className='flex flex-col justify-start'>
        <label className='mt-4 mb-2 text-sm'>Current Slide
        </label>
        <div className='mb-4 flex'>
          <div className='rounded border-2 border-gray-700 p-2 mr-2 text-sm w-2xl min-h-2'>
            {currentOutput}
          </div>
          <button onClick={getCurrentSlideInfo} className='ml-2 mr-2 px-2 py-1 rounded text-xs bg-amber-600 '>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          </button>
        </div>
      </div>

      <div className='flex flex-col justify-start'>
        <label className='mt-4 mb-2 text-sm'>Cue Slides</label>
        <div className='mb-4 flex'>
          <input type='text' className='border-2 border-gray-300 rounded p-1 mr-2 text-sm' placeholder='Search Slide' />
        </div>
      </div>

      <div className='flex items-center justify-between fixed bottom-0 right-0 p-2 text-gray-100 text-sm border-t-cyan-100 w-full bg-gray-900'>
        {showslidecontrols ? (<div className='flex'>
          <button
            onClick={() => { setShowSlideControls(true) }}
            className='bg-gray-500 hover:bg-blue-700 text-black hover:text-white font-bold py-1 px-2 rounded cursor-pointer mr-2'
          >
            <span>&lt;</span><span className='hidden md:hidden'>Hide Controls</span>
          </button>
          <button
            onClick={()=>handleButtonClick('previous_slide')}
            className='bg-red-500 hover:bg-blue-700 text-black hover:text-white font-bold py-1 px-2 rounded cursor-pointer mr-2'
            value={'previous_slide'}
          >
            Previous Slide
          </button>
          <button
            onClick={()=>handleButtonClick('next_slide')}
            className='bg-green-500 hover:bg-blue-700 text-black hover:text-white font-bold py-1 px-2 rounded cursor-pointer'
            value={'next_slide'}
          >
            Next Slide
          </button>
        </div>) : <>
          <button onClick={() => { setShowSlideControls(true) }}>
            <span className='text-sm text-gray-400'>Show Slide Controls</span>
          </button>
        </>
        }
        <p className=''>
          <strong>Minister Info:</strong> {JSON.stringify(ministerformFields)}
        </p>

      </div>
{/* 
      {result && (
        <pre style={{ marginTop: '1rem' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )} */}
    </div>
  );
}

export default App;
