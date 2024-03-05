import {Fragment, useEffect, useState} from "react";
import {Listbox, Transition} from "@headlessui/react";
import {CheckIcon, ChevronUpDownIcon} from "@heroicons/react/20/solid";
import { v4 as uuidv4 } from 'uuid';
import { Command } from '@tauri-apps/api/shell';
import {newSocket} from "../../socket";

const classNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
}

const Form = ({content, connectedClients, successMessage, errorMessage, setIsShow}) => {
    console.log('connectedClients=>', connectedClients);
/*    const [connectedClients, setConnectedClients] = useState([]);*/
    const [selected, setSelected] = useState("");
    const [command, setCommand] = useState("");
    const [jobDone, setJobDone] = useState('');
    const [newJob, setNewJob] = useState('');
    const [output, setOutput] = useState();
/*    const [connectionLog, setConnectionLog] = useState('');*/

/*    const { shell } = useTauri();

   const executeCommand = async () => {
        try {
            const result = await shell.command('ls -la');
            console.log('Command output:', result);
        } catch (error) {
            console.error('Error executing command:', error);
        }
    };
*/
    console.log("selected=>", selected);


    const handleCommand = (event) => {
        setCommand(event.target.value);
    };

    const renderOutputLines = (output) => {

        return output.split('\n').map((line, index) => (

                <div key={index} className='whitespace-pre-wrap'>{line}</div>

        ));
    };

    console.log("command=>", command);

    const jobDoneCall = async(data) => {
        const { taskid:id } = data;
        const output = await new Command('cmd', ["/C", command]).execute();
     /*  const output = await new Command('ls', ['-lah']).execute();
         const output = await new Command('./run_command.sh', ['cs']).execute();
         const output = await new Command('sh', ['-lah', ]).execute();
         const output = await new Command('sh', ['-c', command]).execute();

        const tauri = window.__TAURI__;
        const output =  await tauri.shell.command(command);
        */
        setOutput(output)
        console.log('output.code', output.code)

       if (newSocket) {
           newSocket.emit('JOB_DONE', {result: output.stdout, taskid: id});
       }
    }

    const sendCommand = async() => {
        console.log('output', output)
        console.log("command=>", command, "client=>", selected);

        if(newSocket){
            newSocket.emit('NEW_JOB', { command: command, client: selected, taskid: uuidv4() })
        }
    }

    const handleBack = () => {
        setIsShow(false);
    }

    useEffect(() => {

           /* newSocket.on("connectedClients", (data) => {
                console.log("connectedClientsData", data);
            setConnectionLog(data);
            setConnectedClients(data);
        });*/

       /* newSocket.on('NEW_JOB', (data) => {
            const { command:commandrun, taskid } = data;
            setNewJob(`Recieved command :--> ${commandrun} and task id :--> ${taskid}`)
            console.log(commandrun, "Recieved command and task id", taskid);
            jobDoneCall(data);
        })

        newSocket.on('JOB_DONE', (data) => {
            setJobDone(data.result)
            console.log(data, "This is client 2");
        })
        */
    }, []);

    console.log('jobDone=>', jobDone);
    console.log('newJob=>', newJob);
    console.log('connectedClients=>', connectedClients);

    return (
        <>
            <main className="py-10">
                <div className="px-4 sm:px-6 lg:px-8">{content ? content : ""}
                <div className="bg-whit mt-5 shadow sm:rounded-lg max-w-[800px]" style={{border:'1px solid gray'}}>
            <div className="px-4 py-5 sm:p-6">
                        <Listbox value={selected} onChange={setSelected}>
                            {({open}) => (
                                <>
                                    <Listbox.Label>
                                        Clients list
                                    </Listbox.Label>
                                    <div className="relative mt-2 max-w-[320px]">
                                        <Listbox.Button
                                            className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                  <span className="block truncate">
                                    {selected ? selected : "Select client"}
                                  </span>
                                            <span
                                                className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                  </span>
                                        </Listbox.Button>

                                        <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options
                                                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {[].map((person, index) => (
                                                    <Listbox.Option
                                                        key={index}
                                                        className={({active}) =>
                                                            classNames(
                                                                active
                                                                    ? "bg-indigo-600 text-white"
                                                                    : "text-gray-900",
                                                                "relative cursor-default select-none py-2 pl-3 pr-9"
                                                            )
                                                        }
                                                        value={person}
                                                    >
                                                        {({selected, active}) => (
                                                            <>
                                                <span
                                                    className={classNames(
                                                        selected ? "font-semibold" : "font-normal",
                                                        "block truncate"
                                                    )}
                                                >
                                                  {person}
                                                </span>
                                                                {selected ? (
                                                                    <span
                                                                        className={classNames(
                                                                            active ? "text-white" : "text-indigo-600",
                                                                            "absolute inset-y-0 right-0 flex items-center pr-4"
                                                                        )}>
                                                <CheckIcon
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                              </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Listbox>

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
                                onClick={sendCommand}
                                className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                            >
                                Send
                            </button>
                            <button
                                onClick={handleBack}
                                className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                            >
                                Back
                            </button>


                        </div>
                    </div>
        </div>

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

            {jobDone &&
                <>
                    <p className='my-2'>{`This is the sender`}</p>
                    <p className='my-2'>{`Result :--> `}</p>
                    <p className='my-2 font-mono bg-black text-white p-6'>
                        {renderOutputLines(jobDone)}
                    </p>
                </>
            }

            {newJob && <p className='my-2'>
                {newJob}
            </p>}

          {successMessage && <p className='my-2'>
                         {successMessage}
          </p>}

           {errorMessage && <p className='my-2'>
                         {errorMessage}
          </p>}


         {/*   {connectionLog && <p className='my-2'>
                    {`Client id status:--> [ ${connectionLog} ]`}
                </p>
            }*/}
        </div>

                </div>
            </main>
        </>

    );
}

export default Form;