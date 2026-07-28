Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' This automatically figures out the exact folder path where this file lives
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' This forces Windows to step inside your F1 folder before running the app
shell.CurrentDirectory = currentDir
shell.Run "cmd /c npm start", 0, False