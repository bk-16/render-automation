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
  readItems,
  rest,
  staticToken,
  withOptions,
  refresh,
} from "@directus/sdk";
import { Command } from "@tauri-apps/api/shell";
import { listen } from "@tauri-apps/api/event";

/*Airtable.configure({
    apiKey: `${process.env.REACT_APP_AIRTABLE_API_KEY}`
});

const base = Airtable.base(`${process.env.REACT_APP_BASE_ID}`); */

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

  const [selectedRenderJobs, setSelectedRenderJobs] = useState([]);
  const [connectedClients, setConnectedClients] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [maxJobs, setMaxJobs] = useState();
  const { id } = useParams();
  const content = id
    ? id.charAt(0).toUpperCase() + id.substring(1)
    : "Home page";

  //     const client = createDirectus('http://localhost:8055/').with(staticToken('qmT4Gu0ok2irschFc5vh9QZs3RpyNL60')).with(rest({credentials:'include'}));
  const client = createDirectus("https://renderfarm.jewelpreview.com/")
    .with(staticToken("0AJzuH56xvfEl2lXCt0uu7Tz0aCmfY3y"))
    .with(rest());

  /*    const client = createDirectus('http://localhost:8055/').with(rest());*/

  /*  const fetchData = async() => {
          fetch('http://localhost:8055/items/render_nodes',
              {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer qmT4Gu0ok2irschFc5vh9QZs3RpyNL60`,
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                      'Access-Control-Allow-Headers': 'Content-Type',
                  },
              })
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Network response was not ok');
                  }
                  return response.json();
              })
              .then(data => {
                  console.log('directusData', data);
              })
              .catch(error => {
                  console.error('Fetch error:', error);
              });
       // return await client.request(readItems('Rings'));
      }*/

  const fetchData = async () => {
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
    console.log("directsdata", data);
  };

  const getRenderNodesData = () => {
    fetch("https://api.airtable.com/v0/appduO4uHSNPZ4Ipa/Render Nodes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const disconnected = data?.records?.filter(
          (data) => data?.fields?.Status === "Disconnected"
        );
        setDisconnectedNodes(disconnected);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  };

  useEffect(() => {
    /*    base(`${process.env.REACT_APP_TABLE_NAME}`).select().firstPage(data => {
           console.log('data23=>', data);
           setRecords(data);
       })*/

    /*  base('Render Nodes').select({
              // Selecting the first 3 records in Grid view:
              maxRecords: 3,
              view: "Grid view"
          }).eachPage(function page(data, fetchNextPage) {
              // This function (`page`) will get called for each page of records.

              console.log('data', data)
              data.forEach(function(record) {
                  setRecords(record.fields);
                  console.log('Retrieved', record.get('Node ID'));
                  console.log('record', record.fields);
              });

              // To fetch the next page of records, call `fetchNextPage`.
              // If there are more records, `page` will get called again.
              // If there are no more records, `done` will get called.
              fetchNextPage();

          }, function done(err) {
              if (err) { console.error(err); return; }
          });*/

    /*  fetch('https://api.airtable.com/v0/appduO4uHSNPZ4Ipa/Render Nodes',
              {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`
                  }
              })
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Network response was not ok');
                  }
                  return response.json();
              })
              .then(data => {
  
                  const disconnected = data?.records?.filter((data) => data?.fields?.Status === "Disconnected");
                  setDisconnectedNodes(disconnected);
              })
              .catch(error => {
                  console.error('Fetch error:', error);
              });*/

    fetchData();
    //  getRenderNodesData();

    /*

        fetch('https://api.airtable.com/v0/appduO4uHSNPZ4Ipa/RenderJobs',
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setRenderJobs(data?.records);
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
*/

    /* newSocket.on("connectedClients", (data) => {
            console.log("connectedClientsSidebar=>", data);

            setConnectedClients(data);
        });
    */
  }, []);

  console.log("disconnectedNodes=>", disconnectedNodes);
  console.log("selectedNode=>", selectedNode);
  console.log("renderJobs=>", renderJobs);

  const handleRenderJobsCompleted = async () => {
    console.log("selectedRenderJobsIn=>", selectedRenderJobs);

    /*  const dataDirPath = path.join(documentDir,'/Users/bhargav/Documents/test');
  
          const exists = await path.exists(dataDirPath);
  
          if (exists) {
              console.log('Data directory found:', dataDirPath);
              // Use the directory path for further operations (e.g., reading or writing files)
          } else {
              console.log('Data directory not found.');
          }
  
  
  */

    /*
        selectedRenderJobs.forEach(data => {
            data.fields.Status = "Completed"
        });

        const filteredRecords = selectedRenderJobs.map(record => {
            const { createdTime, fields: { "JobID": jobId, "Created_On": created_on, "Updated_On": updated_on, ...fields }, ...rest } = record;
            return { ...rest, fields };
        });

        console.log('selectedRenderJobsAfter=>', selectedRenderJobs);
        base('RenderJobs').update(
            filteredRecords
            , function (err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function (record) {
                    console.log('Status=>', record.get('Status'));
                    if (record.get('Status') === 'Completed') {
                        setTimeout(() => {
                            setIsShow(true);
                        }, 3000)
                    }

                });
            });*/

    const { job_path, assets_path, output_path, output_dir, octane_path } =
      renderJobsData[0];

    // callRunOctaneRender(job_path, assets_path, output_path, output_dir, octane_path);

    console.log("job_path", job_path);
    console.log("assets_path", assets_path);
    console.log("output_path", output_path);
    console.log("output_dir", output_dir);
    console.log("octane_path", octane_path);
    /*  let command = Command.sidecar('binaries/render');
        const output = await command.execute();

         console.log('commandOutput', output); */

    // const output = await new Command('powershell', ["/C", ["binaries/runOctaneRender", job_path, assets_path, output_path, output_dir, octane_path]]).execute();

    console.log("maxJobs=>", maxJobs);

    const iterations = Array.from({ length: maxJobs }, (_, index) => index + 1);

    const renderOutput = async () => {
      const output = await new Command("powershell", [
        "C:/Users/Public/render-automation/src-tauri/binaries/runOctaneRender-x86_64-pc-windows-msvc.ps1",
        job_path,
        assets_path,
        output_path,
        output_dir,
        octane_path,
      ]).execute();

      /* const output1 = new Command('powershell', [
                'binaries/runOctaneRender-x86_64-pc-windows-msvc.ps1',
                job_path,    
                assets_path, 
                output_path, 
                output_dir, 
                octane_path  
            ]);

            output1.on('close', data => {
                console.log(`command finished with code ${data.code} and signal ${data.signal}`)
                console.log(`close Data${data}`)
              });
              output1.on('error', error => console.error(`command error: "${error}"`));
              output1.stdout.on('data', line => console.log(`command stdout: "${line}"`));
              output1.stderr.on('data', line => console.log(`command stderr: "${line}"`));
              
              const child = await output1.spawn();
              console.log('pid:', child.pid); */

      setSuccessMessage(output.stdout);
    };

    iterations.map(() => renderOutput());
    console.log("CommandOutput", successMessage);

    // if (error) {
    //     console.error('Error:', error);
    // } else {
    //     console.log('Output:', output);
    // }

    // console.log("registering events")

    /*
        command.on('close', data => {
            console.log(`Python subprocess ended with code ${data.code} and signal ${data.signal}`)
            // submitBtn.removeAttribute("disabled")
        })

        command.on('error', error => console.error(`error: "${error}"`))
        command.stdout.on('data', line => console.log("stdout:", line)
            // if (line.startsWith("{")) {
            //     let data = JSON.parse(line)
            //     if (data.message === "processing") {
            //         progress.update(progressBar, (data.current/ data.total) * 100)
            //     } else if (data.message === "done") {
            //         submitBtn.removeAttribute("disabled")
            //     }
            // }
        )
        command.stderr.on('data', line => console.log("stderr:", line))

        // Start the command
        console.log("Python subprocess started...")
        let output = await command.execute()
        console.log('output:', output)
    */

    /*
        const callRunOctaneRender = async () => {
        
            // try {
            //     await invoke('start_sidecar', "render");
            //     console.log('Render command executed successfully');
            //     setSuccessMessage('Render command executed successfully');
            // } catch (error) {
            //     console.error('Failed to execute render command:', error);
            //     setErrorMessage(error);
            // }

           async function startSidecar() {
                try {
                    const response = await invoke('start_sidecar');
                    console.log('Output:', response);
                    setSuccessMessage(response);
                } catch (error) {
               
                    console.error('Error starting sidecar:', error);
                    setErrorMessage(error);
                }

                listen("message", (event) => {
                    const message = event.payload;
                    console.log('Message from Rust:', message);
                    console.log('event.windowLabel:', event.windowLabel);
                 
                    // Handle the message here
                });
                
            }

            // listen("sidecar_output", (event) => {
            //     const outputLine = event.payload;
            //     setSuccessMessage(outputLine);
            //     console.log('Output from sidecar:', outputLine);
            // });

            // invoke('sidecar_output').then((response) => {

            //     setSuccessMessage(response)
            //     console.log('Output:', response);
            // }).catch((error) => {
            //     setErrorMessage(error)
            //     console.error('Error starting sidecar:', error);
            // });
            
            startSidecar();
    
        }

        callRunOctaneRender(); */

    // setSuccessMessage(output);
    //  setIsShow(true);

    //  console.log('handleRenderJobsCompleted', nodeId);
  };

  const renderOutputLines = (output) => {
    return output.split("\n").map((line, index) => (
      <div key={index} className="whitespace-pre-wrap">
        {line}
      </div>
    ));
  };

  const setNodeConnected = async () => {
    console.log("selectedNode++", selectedNode);
    const renderNodeId = disconnected.filter(
      (node) => node?.name === selectedNode
    )[0]?.id;
    console.log("renderNodeId", renderNodeId);

    const maxJobsData = disconnected.filter(
      (node) => node?.name === selectedNode
    )[0]?.max_jobs;
    setMaxJobs(maxJobsData);

    const renderJobsdata = await client.request(
      readItems("render_jobs", {
        filter: {
          render_node: {
            _eq: renderNodeId,
          },
        },
      })
    );

    setRenderJobsData(renderJobsdata);
    //  getRenderNodesData();
    const selectedNodeData = disconnectedNodes.filter(
      (item) => item?.fields?.Name === selectedNode
    );
    //    setNodeId(selectedNodeData[0]?.fields?.Node_ID);
    //    console.log('selectedNodeData=>', );
    disconnectedNodes.forEach((data) => {
      data.fields.Status = "Connected";
    });

    const filteredRecords = selectedNodeData.map((record) => {
      const {
        createdTime,
        fields: { Node_ID: nodeId, ...fields },
        ...rest
      } = record;
      return { ...rest, fields };
    });

    const currentNodeId = selectedNodeData[0]?.fields?.Node_ID.toString();
    const renderJobsData = renderJobs?.filter(
      (data) =>
        data?.fields?.Render_Node === currentNodeId &&
        data?.fields?.Status === "Ready to Render"
    );
    setSelectedRenderJobs(renderJobsData);
    console.log("renderJobsData==>", renderJobsData);

    console.log("filteredRecords=>", filteredRecords);

    /*  base('Render Nodes').update(
            filteredRecords
            , function (err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function (record) {
                    console.log('Status=>', record.get('Status'));
                    if (record.get('Status') === 'Connected') {
                        appWindow.setTitle(selectedNode);
                    }

                });
            });
    */
  };

  console.log("selectedRenderJobs==>", selectedRenderJobs);

  const callRunOctaneRender = async (
    Job_Path,
    Assets_Path,
    Output_Path,
    Output_Dir,
    Octane_Path
  ) => {
    console.log("def", Job_Path);
    try {
      await invoke("run_octane_render", {
        job_path: Job_Path,
        assets_path: Assets_Path,
        output_path: Output_Path,
        output_dir: Output_Dir,
        octane_path: Octane_Path,
      });
      console.log("Render command executed successfully");
      setSuccessMessage("Render command executed successfully");
    } catch (error) {
      console.error("Failed to execute render command:", error);
      setErrorMessage(error);
    }
  };

  console.log("disconnected", disconnected);

  console.log("selectedNode==>", selectedNode);
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

          {/*       <main className="py-10">
                        <div className="px-auto py-auto sm:px-6 lg:px-8">
                            <div className="mt-5 sm:flex sm:items-center">
                                <div className="w-full sm:max-w-xs">
                                    <label>Node name</label>
                                    <input
                                        onChange={(event) => handleNodeName(event)}
                                        type="text"
                                        name="node"
                                        id="node"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </main> */}

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
                          onClick={() => setNodeConnected()}
                          className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                        >
                          Connect
                        </button>
                        {successMessage && (
                          <>
                            {/* <p className="my-2">{`Command Output :--> `}</p> */}
                            <p className="my-2 font-mono bg-black text-white p-6 ml-5">
                              {renderOutputLines(successMessage)}
                              {renderJobsData[0].job_path}
                              {renderJobsData[0].assets_path}
                              {renderJobsData[0].assets_path}
                              {renderJobsData[0].output_path}
                              {renderJobsData[0].output_dir}
                              {renderJobsData[0].octane_path}
                            </p>
                          </>
                        )}
                        {errorMessage}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <Table
                renderJobsData={renderJobsData}
                handleRenderJobsCompleted={handleRenderJobsCompleted}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
