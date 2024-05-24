import { Fragment, useEffect, useState } from "react";
import { Dialog, Listbox, Menu, Transition } from "@headlessui/react";
import { Link, useParams } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import Form from "../Form/Form";
import { appWindow } from "@tauri-apps/api/window";
// import Airtable from 'airtable';
import Table from "../Table/Table";
import { newSocket } from "../../socket";
import {
  appLocalDataDir,
  documentDir,
  appDataDir,
  dirname,
  path,
} from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import {
  createDirectus,
  updateItem,
  readItems,
  rest,
  staticToken,
  withOptions,
  refresh,
} from "@directus/sdk";
import { Command } from "@tauri-apps/api/shell";
import { listen } from "@tauri-apps/api/event";
import AppMenu from "../AppMenu/AppMenu";


const navigation = [
  { name: "Dashboard", href: "dashboard", icon: HomeIcon, current: false },
  { name: "Team", href: "team", icon: UsersIcon, current: false },
  { name: "Projects", href: "projects", icon: FolderIcon, current: false },
];
const teams = [
  { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
  { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
  { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];
const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [disconnectedNodes, setDisconnectedNodes] = useState([]);
  const [disconnected, setDisconnected] = useState([]);
  const [selectedNode, setSelectedNode] = useState("");
  const [renderJobs, setRenderJobs] = useState([]);
  const [renderJobsData, setRenderJobsData] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);

  const [selectedRenderJobs, setSelectedRenderJobs] = useState([]);
  const [connectedClients, setConnectedClients] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [maxJobsCount, setMaxJobsCount] = useState();
  const [nodeId, setNodeId] = useState();

  const [jobsQueue, setJobsQueue] = useState([]);
  const [runningJobs, setRunningJobs] = useState([]);



  const [jobsCountInGetJobs, setJobsCountInGetJobs] = useState();
  const [nodeIdInGetJobs, setNodeIdInGetJobs] = useState();
  const [renderJobsDataInStartJob, setRenderJobsDataInStartJob] = useState();
  const [closeData, setCloseData] = useState("");
  const [callNextJobStatus, setCallNextJobStatus] = useState("");
  


  const { id } = useParams();
  const content = id
    ? id.charAt(0).toUpperCase() + id.substring(1)
    : "Home page";

  const client = createDirectus("https://renderfarm.jewelpreview.com/")
    .with(staticToken("0AJzuH56xvfEl2lXCt0uu7Tz0aCmfY3y"))
    .with(rest());

  const fetchNodeData = async () => {
    const data = await client.request(
      readItems("render_nodes", {
        filter: {
          status: {
            _eq: "disconnected",
          },
        },
      })
    );

    setDisconnected(data);
  };

  useEffect(() => {
         fetchNodeData();
  }, []);

  const nextJob = () => {
    console.log('called next job');
    setCallNextJobStatus('called next job');
    getJobs(nodeId, 1);
  }

  const handleOutputClose = (data) => {
    console.log('Close data:', data);
    setCloseData(data);
    nextJob();
  }

  const handleSuccessOutput = (line) => {
    setSuccessMessage(line)
    console.log('Success data:', line);
  }

  const handleErrorOutput = (line) => {
      setErrorMessage(line);
      console.log('Error data:', line);
  }


  
  const getJobs = async(nodeId, jobsCount) => {


    console.log("selectedNodeInGetJobs=>", selectedNode);

    // Get maxJobs count
    const renderNodeId = disconnected.filter(
      (node) => node?.name === selectedNode
    )[0]?.id;

    setNodeId(renderNodeId);
    console.log("renderNodeIdGetJobs=>", renderNodeId);

    const maxJobsData = disconnected.filter(
      (node) => node?.name === selectedNode
    )[0]?.max_jobs;
    setMaxJobsCount(maxJobsData);


    // const renderJobsdata = await client.request(
    //   readItems("render_jobs", {
    //     filter: {
    //       render_node: {
    //         _eq: renderNodeId,
    //       },
    //     },
    //   })
    // );

    // setRenderJobsData(renderJobsdata);


    console.log('jobsCountInGetJobs=>', jobsCount);
    console.log('nodeIdInGetJobs=>', nodeId);
    setJobsCountInGetJobs(jobsCount);
    setNodeIdInGetJobs(nodeId);

  // Get jobs with limit
    const renderJobs = await client.request(
      readItems("render_jobs", {
        filter: {
          render_node: {
            _eq: nodeId,
          },
          status: {
            _eq: "ready to render",
          }
        },
        limit: jobsCount | undefined,
      })
    );

    console.log("renderJobsInGetJobs=>",renderJobs);

    renderJobs.map((job, index) => {

      startJob(job)
    })

  }


  const startJob = async (renderJobs) => {

    console.log('renderJobsInStartJobs', renderJobs);
    setRenderJobsDataInStartJob(renderJobs);

      // Set initialising job
       const initialisingJobStatus = renderJobs;
       initialisingJobStatus.status = "initialising job";
       console.log('initialisingJobStatus=>', initialisingJobStatus);


      await client.request(updateItem("render_jobs", renderJobs.id, initialisingJobStatus));


      const {job_path, assets_path, output_path, output_dir, octane_path} = renderJobs

    const output = await new Command("powershell", [
      "R:/RenderFarm/Render/OctaneRunner.ps1",
      job_path,
      assets_path,
      output_path,
      output_dir,
      octane_path,
    ]);
    
    // Set rendering in progress
    const inProgressStatus = renderJobs;
    inProgressStatus.status = "rendering in progress";
    console.log('inProgressStatus=>', inProgressStatus);

     await client.request(updateItem("render_jobs", renderJobs.id, inProgressStatus));
     
    // Close event
    output.on('close', data => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`)
      handleOutputClose(data);
  
    });
    
   // Success event
    output.on('error', error => console.error(`command error: "${error}"`));
    output.stdout.on('data', line =>
        
        {
          handleSuccessOutput(line);
        }
    );

    // Error event
    output.stderr.on('data', async (line) =>
     {
      handleErrorOutput(line);

      const match = line.match(/\d+\.\d+/);
      const progress = match ? match[0] : null;
      console.log('progress=>', progress); 

      // Set completed
      if(progress === '100.0') {
         const completedStatus = renderJobs;
         completedStatus.status = "completed";
         console.log('completedStatus=>', completedStatus);
         await client.request(updateItem("render_jobs", renderJobs.id, completedStatus));
       
      }
    
   
    });
    const child = await output.spawn();
    console.log('pid:', child.pid);

  };
  

  const renderOutputLines = (output) => {
   // console.log('renderOutputLines', output);
    return output?.split("\n").map((line, index) => (
      <div key={index} className="whitespace-pre-wrap">
        {line}
      </div>
    ));
  };

  console.log("disconnectedNode=>", disconnected);
  console.log("selectedNodeName==>", selectedNode);
  console.log("renderJobsData==>", renderJobsData);

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=white"
                        alt="Your Company"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.href}
                                  className={classNames(
                                    item.current
                                      ? "bg-indigo-700 text-white"
                                      : "text-indigo-200 hover:text-white hover:bg-indigo-700",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? "text-white"
                                        : "text-indigo-200 group-hover:text-white",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-indigo-200">
                            Your teams
                          </div>
                          <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? "bg-indigo-700 text-white"
                                      : "text-indigo-200 hover:text-white hover:bg-indigo-700",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white">
                                    {team.initial}
                                  </span>
                                  <span className="truncate">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto">
                          <a
                            href="#"
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                          >
                            <Cog6ToothIcon
                              className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
                              aria-hidden="true"
                            />
                            Settings
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=white"
                alt="Your Company"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item, index) => (
                      <Link
                        to={`/${item.href}`}
                        key={index}
                        className={classNames(
                          item.current
                            ? "bg-indigo-700 text-white"
                            : "text-indigo-200 hover:text-white hover:bg-indigo-700",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-indigo-200">
                    Your teams
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? "bg-indigo-700 text-white"
                              : "text-indigo-200 hover:text-white hover:bg-indigo-700",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    <Cog6ToothIcon
                      className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
                      aria-hidden="true"
                    />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="relative flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  name="search"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Separator */}
                <div
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                  aria-hidden="true"
                />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full bg-gray-50"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                        aria-hidden="true"
                      >
                        Tom Cook
                      </span>
                      <ChevronDownIcon
                        className="ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "block px-3 py-1 text-sm leading-6 text-gray-900"
                              )}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          {isShow ? (
            <Form
              content={content}
              connectedClients={connectedClients}
              successMessage={successMessage}
              errorMessage={errorMessage}
              setIsShow={setIsShow}
            />
          ) : (
            <>
              <main className="py-10">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div
                    className="bg-whit mt-5 shadow sm:rounded-lg max-w-[800px]"
                    style={{ border: "1px solid gray" }}
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="mt-5 sm:flex sm:items-center">
                        <div className="w-full sm:max-w-xs">
                          <Listbox
                            value={selectedNode}
                            onChange={setSelectedNode}
                          >
                            {({ open }) => (
                              <>
                                <Listbox.Label>Nodes list</Listbox.Label>
                                <div className="relative mt-2 max-w-[320px]">
                                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <span className="block truncate">
                                      {selectedNode
                                        ? selectedNode
                                        : "Select node"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                      {disconnected.map((nodes, index) => (
                                        <Listbox.Option
                                          key={nodes.id}
                                          className={({ active }) =>
                                            classNames(
                                              active
                                                ? "bg-indigo-600 text-white"
                                                : "text-gray-900",
                                              "relative cursor-default select-none py-2 pl-3 pr-9"
                                            )
                                          }
                                          value={nodes?.name}
                                        >
                                          {({ selected, active }) => (
                                            <>
                                              <span
                                                className={classNames(
                                                  selected
                                                    ? "font-semibold"
                                                    : "font-normal",
                                                  "block truncate"
                                                )}
                                              >
                                                {nodes?.name}
                                              </span>
                                              {selected ? (
                                                <span
                                                  className={classNames(
                                                    active
                                                      ? "text-white"
                                                      : "text-indigo-600",
                                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                                  )}
                                                >
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
                        </div>
                        <button
                          onClick={() =>  getJobs(nodeId, maxJobsCount)}
                          className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                        >
                          Start
                        </button>
                        {successMessage && (
                          <>
                            {/* <p className="my-2">{`Command Output :--> `}</p> */}
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                              {renderOutputLines(successMessage)}
                            </p>
                          </>
                        )}
                        {errorMessage}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <main className="py-10">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div
                    className="bg-whit mt-5 shadow sm:rounded-lg max-w-[800px]"
                    style={{ border: "1px solid gray" }}
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="mt-5 sm:flex sm:items-center">
                        <div className="w-full sm:max-w-xs">

                        { (
                          <>
                            {/* <p className="my-2">{`Command Output :--> `}</p> */}
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                            {`jobsCountInGetJobs--> ${jobsCountInGetJobs}`}
                            </p>
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                            {`nodeIdInGetJobs--> ${nodeIdInGetJobs}` }
                            </p>
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                            {`renderJobsDataInStartJob--> ${renderJobsDataInStartJob}` }
                            </p>
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                            {`closeData--> ${closeData}` }
                            </p>
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                            {`callNextJobStatus--> ${callNextJobStatus}` }
                            </p>

                            
                          </>
                        )}
                         
                         
                        </div>                      
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              <AppMenu />

              
              {/* <Table
                renderJobsData={renderJobsData}
                getJobs={getJobs}
                nodeId={nodeId}
                maxJobsCount={maxJobsCount}
              /> */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
