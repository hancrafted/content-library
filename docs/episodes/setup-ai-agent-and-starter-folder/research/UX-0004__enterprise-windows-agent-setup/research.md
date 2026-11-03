---
type: research
title: Why does a beginner Windows AI-agent workshop need an enterprise-approved
  setup route?
description: Windows setup needs separate checks for approved installation,
  shell, account, network and working folder; a successful download or terminal
  launch proves none of the others.
stale_after: 2027-05-04T00:00:00Z
sources:
  - id: 1
    resource: https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows
    title: Microsoft, Install PowerShell on Windows
  - id: 2
    resource: https://learn.microsoft.com/en-us/windows/terminal/install
    title: Microsoft, Install and get started setting up Windows Terminal
  - id: 3
    resource: https://code.claude.com/docs/en/setup
    title: Anthropic, Advanced setup
  - id: 4
    resource: https://code.claude.com/docs/en/terminal-guide
    title: Anthropic, Terminal configuration
  - id: 5
    resource: https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/README.md
    title: OpenAI, Codex README
  - id: 6
    resource: https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/scripts/install/install.ps1
    title: OpenAI, Codex Windows installer
  - id: 7
    resource: https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/codex-rs/windows-sandbox-rs/src/setup.rs
    title: OpenAI, Codex Windows sandbox setup
  - id: 8
    resource: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan
    title: OpenAI, Using Codex with your ChatGPT plan
  - id: 9
    resource: https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli
    title: GitHub, Installing GitHub Copilot CLI
  - id: 10
    resource: https://github.com/microsoft/winget-pkgs/blob/master/manifests/g/GitHub/Copilot/1.0.105/GitHub.Copilot.installer.yaml
    title: Microsoft, GitHub Copilot WinGet package manifest
  - id: 11
    resource: https://antigravity.google/docs/getting-started.md
    title: Google, Antigravity getting started
  - id: 12
    resource: https://antigravity.google/cli/install.ps1
    title: Google, Antigravity Windows CLI installer
  - id: 13
    resource: https://antigravity.google/docs/enterprise
    title: Google, Antigravity enterprise guide
  - id: 14
    resource: https://learn.microsoft.com/en-us/windows/package-manager/winget/
    title: Microsoft, Use WinGet to install and manage applications
  - id: 15
    resource: https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-desktopappinstaller
    title: Microsoft, Policy CSP DesktopAppInstaller
  - id: 16
    resource: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1
    title: Microsoft, About execution policies
  - id: 17
    resource: https://code.claude.com/docs/en/network-config.md
    title: Anthropic, Enterprise network configuration
  - id: 18
    resource: https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/network-settings
    title: GitHub, Network settings for GitHub Copilot
  - id: 19
    resource: https://docs.github.com/en/copilot/reference/copilot-allowlist-reference
    title: GitHub, Copilot allowlist reference
  - id: 20
    resource: https://devblogs.microsoft.com/commandline/rumors-of-cmds-death-have-been-greatly-exaggerated/
    title: Microsoft, Rumors of Cmd's death have been greatly exaggerated
  - id: 21
    resource: https://github.com/microsoft/terminal/blob/188822fa51dba7e11b64801483f4909db5fd020a/src/cascadia/ShellExtension/OpenTerminalHere.cpp
    title: Microsoft, Windows Terminal Explorer shell extension
  - id: 22
    resource: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-location?view=powershell-5.1
    title: Microsoft, Get-Location
  - id: 23
    resource: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/set-location?view=powershell-5.1
    title: Microsoft, Set-Location
  - id: 24
    resource: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-content?view=powershell-5.1
    title: Microsoft, Get-Content
  - id: 25
    resource: https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/zip-and-unzip-files
    title: Microsoft, Zip and unzip files
  - id: 26
    resource: https://learn.microsoft.com/en-us/defender-endpoint/controlled-folder-access-overview
    title: Microsoft, Protect important folders with controlled folder access
generated:
  by: copilot-cli/gpt-6.1-sol
  at: 2026-11-03T18:49:26Z
---

# Why does a beginner Windows AI-agent workshop need an enterprise-approved setup route?

## Context

A beginner on a managed Windows laptop may be able to open a terminal but lack permission to install or run an application, authenticate to its service, or let it modify files. The critical outcome is an approved agent that can work in the extracted workshop folder, not merely a completed installer. This research examines vendor documentation and public source code; it does not report Windows testing.

## Answer

Use one organization-approved agent and shell combination per workshop cohort, with installation, authentication and service access checked before the workshop. Treat shell version, executable availability, account authorization, current folder and actual file access as separate checkpoints. This is a workshop-design recommendation derived from the documented prerequisites and enterprise controls below, not a Windows-tested procedure. A policy block, unexpected administrator prompt or certificate error needs an IT-approved resolution rather than participant-led changes to security settings.

## Findings

1. **Windows PowerShell is not PowerShell 7, and Terminal is not either shell.** Microsoft documents Windows PowerShell 5.1 and PowerShell 7 as side-by-side installations. Windows Terminal hosts configurable profiles, so "Open in Terminal" does not establish which shell or version opened. Check `$PSVersionTable.PSVersion`; `powershell` refers to Windows PowerShell, while modern PowerShell uses `pwsh`. Microsoft documents single-user and ZIP distribution options for PowerShell 7, but these do not establish organizational permission to install it. [1][2]

2. **Claude Code has an explicitly documented native, non-administrator Windows route.** Anthropic lists Windows 10 version 1809+ or Windows Server 2019+, x64 or ARM64, and 4 GB+ RAM. Its PowerShell installer is `irm https://claude.ai/install.ps1 | iex`; open a fresh terminal afterward and run `claude --version`. Its native launcher directory is under the user's `.local\bin`. Current documentation makes Git for Windows optional: without Git Bash, Claude uses its PowerShell tool. Do not add Node, WSL or Git Bash as universal prerequisites for this route. Eligible account access is a separate requirement; free Claude chat does not include Claude Code. [3][4]

3. **Codex's Windows install command is officially documented, but includes a policy override.** OpenAI's README gives `powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"`. The inspected installer writes its launcher under `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin` and updates the user PATH. This is evidence for a user-scoped installer, not an unconditional enterprise-workshop instruction to override execution policy. The direct installer endpoint returned HTTP 403 to the research environment; implementation details were checked in OpenAI's repository copy. [5][6][16]

4. **Codex's sandbox can introduce an elevation step after installation.** The inspected Windows sandbox setup has an elevated provisioning path. A user-directory installation therefore does not justify promising that every subsequent step needs no administrator. IT should approve the sandbox configuration before the workshop; unexpected elevation should not be "fixed" by disabling the sandbox. Codex account/workspace authorization is also separate from installation; OpenAI's current account documentation includes Free and Go alongside paid ChatGPT plans, with different limits and organization controls. [7][8]

5. **The guide's built-in PowerShell route misses Copilot's documented prerequisite.** GitHub requires PowerShell 6+ on Windows, while the inspected Copilot 1.0.105 WinGet manifest declares a PowerShell 7 dependency. GitHub documents `winget install GitHub.Copilot`, an npm alternative requiring Node 22+, and a direct-release executable download. Opening Windows PowerShell 5.1 does not meet the newer-shell prerequisite. Have IT provision an approved shell and CLI distribution instead of sending novices through package-manager repair and alternative installers. [1][9][10]

6. **Antigravity CLI's installer and launch are directly documented.** Google gives `irm https://antigravity.google/cli/install.ps1 | iex`, followed by `agy --version` and `agy`. Its installer targets `%LOCALAPPDATA%\agy\bin`, then delegates environment setup to `agy.exe install`; script completion alone does not establish usable PATH. The inspected script supports AMD64 and ARM64. Exact minimum Windows and PowerShell versions for the CLI were not established: graphical-app requirements must not silently be applied to the CLI. Enterprise deployment has its own organization, project, license and IAM requirements. [11][12][13]

7. **WinGet is neither universal nor a no-admin guarantee.** Microsoft distributes it through App Installer on supported Windows versions, but App Installer may be absent, and enterprise policy can disable package operations or restrict sources. Some installers launched from a non-administrator WinGet session still request elevation. Missing WinGet is therefore a distinct prerequisite/policy issue, not just another generic install error. [14][15]

8. **Execution-policy errors need diagnosis rather than a blanket bypass.** Microsoft distinguishes interactive commands from script files and gives Group Policy precedence over process/user settings. `Get-ExecutionPolicy -List` is useful diagnostic output for IT. Do not present unrestricted policy, registry edits or shell switching as generic participant recovery steps for an organizational block. [16]

9. **Zscaler-related failures can involve different layers.** Proxy configuration, corporate certificate trust and endpoint permission are separate concerns. Anthropic documents proxy variables, custom CA configuration and network endpoints. GitHub explicitly discusses transparent proxies, OS certificate trust and Zscaler, but its surrounding editor-oriented guidance does not prove that every standalone CLI release works with every Zscaler deployment. A page opening successfully in a browser is not a sufficient end-to-end CLI check. [17][18]

10. **IT needs product-specific network documentation, not one guessed domain list.** Use Anthropic's Claude Code network requirements, GitHub's Copilot allowlist, and Google's Antigravity enterprise endpoint table. Google's enterprise list is not a complete personal-account CLI allowlist. OpenAI's installer README establishes `chatgpt.com`, `releases.openai.com` and GitHub Releases fallback for installation, but this research did not establish a complete current native Codex CLI authentication/runtime allowlist. Ask IT to resolve proxy/certificate/allowlist configuration; do not make disabling TLS validation or changing networks a workshop recovery step. [5][13][17][18][19]

11. **A single right-click label cannot cover all Windows machines.** Microsoft's historical Windows guidance documents the Shift-right-click PowerShell entry. The current Windows Terminal shell-extension source supplies its own terminal action, passes the directory with `-d`, and does not explicitly select PowerShell 7. It also distinguishes compressed/non-filesystem locations and elevation gestures. Consequently "Open in Terminal" is a valid route on appropriately configured machines, not a universal label or a shell-version guarantee. Exact placement on current managed Windows builds remains untested. [20][21]

12. **Explorer's address bar offers a less menu-dependent route, with a shell caveat.** Microsoft documents entering `powershell` in Explorer's address bar to launch at that location. Recommendation: first open the actual extracted folder, use this route when Windows PowerShell is suitable, then enter `Get-Location`. For an agent needing modern PowerShell, use an IT-provisioned `pwsh` route instead and verify the version and folder. The Microsoft address-bar explanation is historical evidence, not a current Windows 10/11 enterprise test. [1][20][22]

13. **Use the actual folder path, not an assumed Downloads path.** `Get-Location` prints the current location. If wrong, `Set-Location -LiteralPath '<actual absolute folder path>'` selects the exact path without wildcard interpretation; replace the placeholder with the participant's copied path, then check again. A relative `cd Downloads\hancrafted-workshop-starter` depends on the starting location and extraction destination. Window-title or prompt appearance is a weaker checkpoint than explicitly inspecting the location. [22][23]

14. **Extraction and file access need their own checks.** Microsoft instructs users to choose **Extract All...** for a ZIP. Controlled Folder Access can allow reading while preventing an untrusted executable from modifying protected folders, so successful folder navigation or reading is not proof of later write access. Ask IT for an approved writable working location/application allowance; do not disable folder protection. [25][26]

15. **Separate the success checkpoints.** The recommended participant sequence is: a fresh window runs the chosen agent's version command; the approved account signs in and completes a harmless request; `Get-Location` shows the extracted starter folder; `Get-Content -LiteralPath '.\GLOSSARY.md' -TotalCount 3` reads the expected starter file; the agent itself reads that file and reports its first heading without editing anything. The local archive inspected on macOS contains a root `GLOSSARY.md` starting `# hancrafted workshop starter`; this is not a Windows extraction test. Vendor documentation supports the install/login checks and Microsoft documents the folder/file commands. [3][8][9][11][22][24]

## Caveats

- No Windows installation, Explorer interaction, UAC, policy enforcement, Zscaler connection, certificate deployment or agent file operation was exercised. Documentation verification is not a substitute for an end-to-end Windows smoke test.
- Source code at a cited commit may differ from an organization's installed release. The WinGet manifest is package-version-specific, not a universal installation contract.
- Complete current native Codex CLI and Antigravity personal-account CLI network allowlists were not verified. Zscaler's own application-specific trust-store article body was not independently accessible.
- Definitive minimum CLI Windows/PowerShell versions for Codex and Antigravity were not established. Do not substitute IDE requirements.
- The least-branching cohort route and proposed checkpoints are recommendations, not measured evidence that novices complete them successfully.
- Suggested participant stop wording: "If Windows asks for an administrator password, says your organization blocked something, shows a certificate error, or denies account access, stop and contact your workshop organizer or IT. Do not change security settings or switch networks to get around the block. Share only the error after removing tokens, personal information and confidential details."
- Suggested organizer prerequisite: obtain approval for the agent, account, installation, network access and starter files before participants begin. Keep alternative installers and proxy/certificate diagnostics in organizer/IT guidance, not the beginner happy path.

[1]: <https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows> "Microsoft, Install PowerShell on Windows"
[2]: <https://learn.microsoft.com/en-us/windows/terminal/install> "Microsoft, Install and get started setting up Windows Terminal"
[3]: <https://code.claude.com/docs/en/setup> "Anthropic, Advanced setup"
[4]: <https://code.claude.com/docs/en/terminal-guide> "Anthropic, Terminal configuration"
[5]: <https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/README.md> "OpenAI, Codex README"
[6]: <https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/scripts/install/install.ps1> "OpenAI, Codex Windows installer"
[7]: <https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/codex-rs/windows-sandbox-rs/src/setup.rs> "OpenAI, Codex Windows sandbox setup"
[8]: <https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan> "OpenAI, Using Codex with your ChatGPT plan"
[9]: <https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli> "GitHub, Installing GitHub Copilot CLI"
[10]: <https://github.com/microsoft/winget-pkgs/blob/master/manifests/g/GitHub/Copilot/1.0.105/GitHub.Copilot.installer.yaml> "Microsoft, GitHub Copilot WinGet package manifest"
[11]: <https://antigravity.google/docs/getting-started.md> "Google, Antigravity getting started"
[12]: <https://antigravity.google/cli/install.ps1> "Google, Antigravity Windows CLI installer"
[13]: <https://antigravity.google/docs/enterprise> "Google, Antigravity enterprise guide"
[14]: <https://learn.microsoft.com/en-us/windows/package-manager/winget/> "Microsoft, Use WinGet to install and manage applications"
[15]: <https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-desktopappinstaller> "Microsoft, Policy CSP DesktopAppInstaller"
[16]: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1> "Microsoft, About execution policies"
[17]: <https://code.claude.com/docs/en/network-config.md> "Anthropic, Enterprise network configuration"
[18]: <https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/network-settings> "GitHub, Network settings for GitHub Copilot"
[19]: <https://docs.github.com/en/copilot/reference/copilot-allowlist-reference> "GitHub, Copilot allowlist reference"
[20]: <https://devblogs.microsoft.com/commandline/rumors-of-cmds-death-have-been-greatly-exaggerated/> "Microsoft, Rumors of Cmd's death have been greatly exaggerated"
[21]: <https://github.com/microsoft/terminal/blob/188822fa51dba7e11b64801483f4909db5fd020a/src/cascadia/ShellExtension/OpenTerminalHere.cpp> "Microsoft, Windows Terminal Explorer shell extension"
[22]: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-location?view=powershell-5.1> "Microsoft, Get-Location"
[23]: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/set-location?view=powershell-5.1> "Microsoft, Set-Location"
[24]: <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-content?view=powershell-5.1> "Microsoft, Get-Content"
[25]: <https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/zip-and-unzip-files> "Microsoft, Zip and unzip files"
[26]: <https://learn.microsoft.com/en-us/defender-endpoint/controlled-folder-access-overview> "Microsoft, Protect important folders with controlled folder access"
