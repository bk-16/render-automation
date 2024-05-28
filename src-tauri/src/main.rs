// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;
use tauri::api::process::Command;
use tauri::Window;
use tauri::api::process::CommandEvent;


// fn main() {
//   tauri::Builder::default()
//     .invoke_handler(tauri::generate_handler![])
//     .run(tauri::generate_context!())
//     .expect("error while running tauri application");
// }


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













use serde::Serialize;
// use tauri_plugin_store;
// use tauri_plugin_window_state;
// use window_shadows::set_shadow;
#[cfg(target_os = "linux")]
use fork::{daemon, Fork};
#[cfg(target_os = "linux")]
use std::{fs::metadata, path::PathBuf};
use std::{sync::Mutex};
// Manager is used by .get_window
use tauri::{self, Manager, SystemTray, SystemTrayMenu, SystemTraySubmenu, CustomMenuItem, SystemTrayMenuItem, SystemTrayEvent, WindowEvent, AppHandle};

#[derive(Clone, Serialize)]
struct SingleInstancePayload {
  args: Vec<String>,
  cwd: String,
}

#[derive(Clone, Serialize)]
struct SystemTrayPayload {
  message: String
}

enum TrayState {
  NotPlaying,
  Paused,
  Playing
}

#[derive(Debug, Default, Serialize)]
struct Example<'a> {
    #[serde(rename = "Attribute 1")]
    attribute_1: &'a str,
}

fn create_tray_menu(_lang: String) -> SystemTrayMenu {
  // TODO: https://docs.rs/rust-i18n/latest/rust_i18n/
  // untested, not sure if the macro accepts dynamic languages
  // ENTER rust_i18n::set_locale(lang) IF LOCAL=lang DOES NOT COMPILE
  SystemTrayMenu::new()
    // .add_item("id".into(), t!("Label", locale = lang))
    // .add_item("id".into(), t!("Label")
    // .add_submenu("Submenu")
    // .add_native_item(item)
}

#[tauri::command]
#[allow(unused_must_use)]
fn update_tray_lang(app_handle: tauri::AppHandle, lang: String) {
  let tray_handle = app_handle.tray_handle();
  tray_handle.set_menu(create_tray_menu(lang));
}

#[tauri::command]
fn process_file(filepath: String) -> String {
    println!("Processing file: {}", filepath);
    "Hello from Rust!".into()
}

// TODO: organize better
#[tauri::command]
fn show_in_folder(path: String) {
  #[cfg(target_os = "windows")]
  {
    Command::new("explorer")
        .args(["/select,", &path]) // The comma after select is not a typo
        .spawn()
        .unwrap();
  }

  #[cfg(target_os = "linux")]
  {
    if path.contains(",") {
      // see https://gitlab.freedesktop.org/dbus/dbus/-/issues/76
      let new_path = match metadata(&path).unwrap().is_dir() {
        true => path,
        false => {
          let mut path2 = PathBuf::from(path);
          path2.pop();
          path2.into_os_string().into_string().unwrap()
        }
      };
      Command::new("xdg-open")
          .arg(&new_path)
          .spawn()
          .unwrap();
    } else {
      if let Ok(Fork::Child) = daemon(false, false) {
        Command::new("dbus-send")
            .args(["--session", "--dest=org.freedesktop.FileManager1", "--type=method_call",
                  "/org/freedesktop/FileManager1", "org.freedesktop.FileManager1.ShowItems",
                  format!("array:string:\"file://{path}\"").as_str(), "string:\"\""])
            .spawn()
            .unwrap();
      }
    }
  }

  #[cfg(target_os = "macos")]
  {
    Command::new("open")
        .args(["-R", &path])
        .spawn()
        .unwrap();
  }
}

fn main() {
  // https://docs.rs/tauri/1.2.2/tauri/struct.SystemTrayMenu.html
  let tray_menu_en = SystemTrayMenu::new()
      .add_submenu(
        SystemTraySubmenu::new("Commands", SystemTrayMenu::new()
            .add_item(CustomMenuItem::new("mkdir".to_string(), "mkdir"))
            // https://docs.rs/tauri/1.2.2/tauri/enum.SystemTrayMenuItem.html
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(CustomMenuItem::new("ls -lah".to_string(), "ls -lah"))
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(CustomMenuItem::new("echo".to_string(), "echo"))
        ))
    // https://docs.rs/tauri/1.2.2/tauri/struct.CustomMenuItem.html#
    .add_item(CustomMenuItem::new("toggle-visibility".to_string(), "Open App"))
    .add_item(CustomMenuItem::new("mkdir".to_string(), "mkdir"))
    .add_item(CustomMenuItem::new("ls -lah".to_string(), "ls -lah"))
    .add_item(CustomMenuItem::new("echo".to_string(), "echo"))
    .add_item(CustomMenuItem::new("toggle-tray-icon".to_string(), "Toggle the tray icon"))
    .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));
  // https://docs.rs/tauri/1.2.2/tauri/struct.SystemTray.html
  let system_tray = SystemTray::new().with_menu(tray_menu_en).with_id("main-tray");

  // main window should be invisible to allow either the setup delay or the plugin to show the window
  tauri::Builder::default()
  
      // Prevent close event and hide window app
      .on_window_event(|event| match event.event() {
        tauri::WindowEvent::CloseRequested { api, .. } => {
          event.window().hide().unwrap();
          api.prevent_close();
        }
      _ => {}
    })
  
    // system tray
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
      // https://tauri.app/v1/guides/features/system-tray/#preventing-the-app-from-closing
      SystemTrayEvent::MenuItemClick { id, .. } => {
        let main_window = app.get_window("main").unwrap();
        main_window.emit("systemTray", SystemTrayPayload { message: id.clone() }).unwrap();
        let item_handle = app.tray_handle().get_item(&id);
        match id.as_str() {
          "quit" => { std::process::exit(0); }
          // "toggle-tray-icon" => {
          //     let tray_state_mutex = app.state::<Mutex<TrayState>>();
          //     let mut tray_state = tray_state_mutex.lock().unwrap();
          //     match *tray_state {
          //       TrayState::NotPlaying => {
          //         app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/SystemTray2.ico").to_vec())).unwrap();
          //         *tray_state = TrayState::Playing;
          //       }
          //       TrayState::Playing => {
          //         app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/SystemTray1.ico").to_vec())).unwrap();
          //         *tray_state = TrayState::NotPlaying;
          //       }
          //       TrayState::Paused => {},
          //     };
          // }
          "toggle-visibility" => {
            // update menu item example
            if main_window.is_visible().unwrap() {
                main_window.hide().unwrap();
                item_handle.set_title("Open App").unwrap();
            } else {
                main_window.show().unwrap();
                item_handle.set_title("Hide App").unwrap();
            }
          }
          _ => {}
        }
      }
      SystemTrayEvent::LeftClick { position: _, size: _, .. } => {
        let main_window = app.get_window("main").unwrap();
      //  main_window.emit("system-tray", SystemTrayPayload { message: "left-click".into() }).unwrap();
        println!("system tray received a left click");

        // main_window.show().unwrap();

        
      }
      SystemTrayEvent::RightClick { position: _, size: _, .. } => {
        println!("system tray received a right click");
      }
      SystemTrayEvent::DoubleClick { position: _, size: _, .. } => {
        println!("system tray received a double click");
      }
      _ => {}
    })
    // custom commands
    .invoke_handler(tauri::generate_handler![/* show_main_window, */update_tray_lang, process_file, show_in_folder])
    .setup(|app| {
        app.manage(Mutex::new(TrayState::NotPlaying));
        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}