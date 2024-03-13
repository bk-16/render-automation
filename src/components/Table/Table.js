const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
]

const Table = ({renderJobsData, getJobs, nodeId, maxJobsCount}) => {
    console.log('renderJobsData=>', renderJobsData);
    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Render Jobs</h1>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Job ID
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Render Node
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        SKU
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Assets Path
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Output Path
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Job Path
                                    </th>
                                     <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Octane Path
                                    </th>
                                     <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Output Directory
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Updated On
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Created On
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {renderJobsData.map((data, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {data?.id}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.status}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.render_node}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.sku}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.assets_path}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.output_path}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.job_path}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.octane_path}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.output_dir}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.date_updated}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{data?.date_created}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <a href="#" className="text-indigo-600 hover:text-indigo-900" onClick={() => getJobs(nodeId, maxJobsCount)}>
                                                Complete
                                            </a>
                                         {/*   <button
                                                onClick={() => handleRenderJobsCompleted(data?.fields?.Render_Node)}
                                                className="!mt-7 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                                            >
                                                Done
                                            </button>*/}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Table;