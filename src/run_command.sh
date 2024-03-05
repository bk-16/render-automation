#!/bin/bash

# Function to detect the operating system
detect_os() {
    case "$(uname -s)" in
        Linux*)     OS=Linux;;
        Darwin*)    OS=Mac;;
        CYGWIN*)    OS=Cygwin;;
        MINGW*)     OS=MinGw;;
        *)          OS="UNKNOWN:${unameOut}"
    esac
    echo $OS
}

# Function to execute the command based on OS
run_command() {
    if [ "$OS" == "Cygwin" ] || [ "$OS" == "MinGw" ]; then
        cmd.exe /c "$@"
    else
        "$@"
    fi
}

# Main function
main() {
    if [ $# -lt 1 ]; then
        echo "Usage: $0 <command> [arguments...]"
        exit 1
    fi

    # Detect the operating system
    detect_os

    # Extract command and arguments
    command="$1"
    shift

    # Run the command
    run_command "$command" "$@"
}

# Call the main function with arguments
main "$@"
