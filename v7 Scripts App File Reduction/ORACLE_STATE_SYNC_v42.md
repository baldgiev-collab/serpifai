Error Found	Technical Cause	Forensic Fix
No Project Selected	Server is checking UserProperties instead of the passed JSON.	Force check projectData.id in runWorkflowStage.
0/14 Tabs Injected	Key Mismatch between Gemini JSON and UI logic.	Implement UPP_KeyMapper to translate AI keys.
Async Timeout	Script exceeds 30s threshold for heavy AI analysis.	Shift to "Status Polling" or immediate ACK return.