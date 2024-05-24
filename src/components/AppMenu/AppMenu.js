import React, {useState, useEffect} from 'react';
import {Command} from "@tauri-apps/api/shell";
import { listen } from '@tauri-apps/api/event';

const AppMenu = () => {
    const [output, setOutput] = useState();
    const [command, setCommand] = useState('');
    const [enteredCommand, setEnteredCommand] = useState('');

    const runDirectoryCommand = async() => {
        const output = await new Command('sh', ['-c', 'mkdir test']).execute();
        setOutput(output);
    }

    const handleCommand = (event) => {
        setEnteredCommand(event.target.value);
    }

    const runEchoCommand = async() => {
        const output = await new Command('sh', ['-c', 'echo Hello, i am the best!']).execute();
        setOutput(output);
    }
    
    const runLsCommand = async() => {
        const output = await new Command('sh', ['-c', 'ls -lah']).execute();
        setOutput(output);
    }

    const runCommand = async() => {
        const output = await new Command('sh', ['-c', enteredCommand]).execute();
        setOutput(output);
        setCommand(enteredCommand);
    }

    const renderOutputLines = (output) => {

        return output && output.split('\n').map((line, index) => (

            <div key={index} className='whitespace-pre-wrap'>{line}</div>

        ));
    };

    useEffect(() => {

      listen('systemTray', ({ payload }) => {

        console.log(payload.message);

        setCommand(payload.message)
      })

      switch (command) {
        case "mkdir":
            runDirectoryCommand();
            break;
        case "echo":
            runEchoCommand();
            break;
        case "ls -lah":
            runLsCommand();
            break;

        default:
            break;
    }

    }, [command]);

    return (
        <>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="mt-5 sm:flex sm:items-center">
                        <div className="w-full sm:max-w-xs">
                                <label>Command</label>
                                <input
                                    onChange={(event) => handleCommand(event)}
                                    type="text"
                                    name="command"
                                    id="command"
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                        </div>
                        <button
                                onClick={runCommand}
                                type='submit'
                                className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                            >
                                Run
                        </button>
                    </div>
                    <p className='my-6 font-semibold text-lg'>{`Selected command :--> ${command}`}</p>
                    <div className="bg-whit mt-5 shadow sm:rounded-lg max-w-[800px] py-10 px-5" style={{border:'1px solid gray'}}>
                        {output &&
                        <>
                            <p className='my-2'>{`Command Output :--> `}</p>
                            <p className='my-2 font-mono bg-black text-white p-6'>
                                {renderOutputLines(output.stdout)}
                            </p>
                        </>

                        }

                        {output && <p className='my-2'>
                            {`Execution status :--> ${ !output.code ? 'Succeed': 'Failed'}`}
                        </p>
                        }

                        {output && <p className='my-2'>
                            {`Command Error :--> ${ output.stderr}`}
                        </p>
                        }
                    </div>
                </div>
        </>
    )

};

export default AppMenu;
