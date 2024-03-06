// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;
use tauri::api::process::Command;
use tauri::Window;
use tauri::api::process::CommandEvent;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


// #[tauri::command]
// fn run_octane_render(job_path: String, assets_path: String, output_path: String, output_dir: String, octane_path: String) -> Result<(), String> {
//     let script_path = "src/RunOctaneRender.ps1";

//      println!("job_path: {}", job_path);

//        let job_paths = "C:\\Users\\Jeet\\Documents\\RB001\\PKRCLP\\EMR\\050\\CNL\\";
//        let assets_paths = "C:\\RenderFarm\\assets";
//        let output_paths ="C:\\RenderFarm\\output\\images";
//        let output_dirs = "A-B-C";
//        let octane_paths = "D:\\RenderFarm\\octane";

//     // Construct the command to execute the PowerShell script
// //     let output = std::process::Command::new("powershell")
// //         .args([
// //             "-File", script_path,
// //             "-jobPath", job_paths,
// //             "-assetsPath", assets_paths,
// //             "-outputPath", output_paths,
// //             "-outputDir", output_dirs,
// //             "-octanePath", octane_paths,
// //         ])
// //         .output();
//         let output = std::process::Command::new("powershell")
//             .arg("-File")
//             .arg(script_path)
//             .arg("-jobPath")
//             .arg(job_paths)
//             .arg("-assetsPath")
//             .arg(assets_paths)
//             .arg("-outputPath")
//             .arg(output_paths)
//             .arg("-outputDir")
//             .arg(output_dirs)
//             .arg("-octanePath")
//             .arg(octane_paths)
//             .output();

//     match output {
//         Ok(output) => {
//             if output.status.success() {
//                 Ok(())
//             } else {
//                 Err(String::from_utf8_lossy(&output.stderr).to_string())
//             }
//         },
//         Err(e) => Err(e.to_string()),
//     }
// }

// #[tauri::command]
// async fn start_sidecar(window: Window) {
//     let (mut rx, mut child) = Command::new_sidecar("render1")
//         .expect("failed to create `my-sidecar` binary command")
//         .spawn()
//         .expect("Failed to spawn sidecar");

//     tauri::async_runtime::spawn(async move {
//         // read events such as stdout
//         while let Some(event) = rx.recv().await {
//             if let CommandEvent::Stdout(line) = event {
//                 window
//                     .emit("message", Some(format!("'{}'", line)))
//                     .expect("failed to emit event");
//                 // write to stdin
//                 child.write("message from Rust\n".as_bytes()).unwrap();
//             }
//         }
//     });
// }



