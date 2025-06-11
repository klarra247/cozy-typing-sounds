import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

class SoundPlayer {
    private webviewPanel: vscode.WebviewPanel | undefined;
    private keyToSoundMap: Map<string, string> = new Map([
        // 알파벳 (a-z)
        ['a', 'a.wav'], ['b', 'b.wav'], ['c', 'c.wav'], ['d', 'd.wav'], ['e', 'e.wav'],
        ['f', 'f.wav'], ['g', 'g.wav'], ['h', 'h.wav'], ['i', 'i.wav'], ['j', 'j.wav'],
        ['k', 'k.wav'], ['l', 'l.wav'], ['m', 'm.wav'], ['n', 'n.wav'], ['o', 'o.wav'],
        ['p', 'p.wav'], ['q', 'q.wav'], ['r', 'r.wav'], ['s', 's.wav'], ['t', 't.wav'],
        ['u', 'u.wav'], ['v', 'v.wav'], ['w', 'w.wav'], ['x', 'x.wav'], ['y', 'y.wav'], ['z', 'z.wav'],

        // 숫자 (1-10)
        ['1', '1.wav'], ['2', '2.wav'], ['3', '3.wav'], ['4', '4.wav'], ['5', '5.wav'],
        ['6', '6.wav'], ['7', '7.wav'], ['8', '8.wav'], ['9', '9.wav'], ['0', '10.wav'],

        // 특수문자
        ['&', 'ampersand.wav'], ['*', 'asterisk.wav'], ['@', 'at.wav'],
        ['}', 'brace_closed.wav'], ['{', 'brace_open.wav'], [']', 'bracket_closed.wav'],
        ['[', 'bracket_open.wav'], ['^', 'caret.wav'], ['$', 'dollar.wav'],
        ['!', 'exclamation.wav'], [')', 'parenthesis_closed.wav'], ['(', 'parenthesis_open.wav'],
        ['%', 'percent.wav'], ['#', 'pound.wav'], ['?', 'question.wav'],
        ['\\', 'slash_back.wav'], ['/', 'slash_forward.wav'], ['~', 'tilde.wav'],
        [' ', 'default.wav'], ['\t', 'tab.wav'], ['\n', 'enter.wav'],

        // 한글 자음 (기본 알파벳 매핑)
        ['ㄱ', 'g.wav'], ['ㄴ', 'n.wav'], ['ㄷ', 'd.wav'], ['ㄹ', 'l.wav'], ['ㅁ', 'm.wav'],
        ['ㅂ', 'b.wav'], ['ㅅ', 's.wav'], ['ㅇ', 'default.wav'], ['ㅈ', 'j.wav'], ['ㅊ', 'c.wav'],
        ['ㅋ', 'k.wav'], ['ㅌ', 't.wav'], ['ㅍ', 'p.wav'], ['ㅎ', 'h.wav'],

        // 한글 모음 (기본 알파벳 매핑)
        ['ㅏ', 'a.wav'], ['ㅑ', 'a.wav'], ['ㅓ', 'e.wav'], ['ㅕ', 'e.wav'], ['ㅗ', 'o.wav'],
        ['ㅛ', 'o.wav'], ['ㅜ', 'u.wav'], ['ㅠ', 'u.wav'], ['ㅡ', 'i.wav'], ['ㅣ', 'i.wav'],

        // 복합 자음
        ['ㄲ', 'g.wav'], ['ㄸ', 'd.wav'], ['ㅃ', 'b.wav'], ['ㅆ', 's.wav'], ['ㅉ', 'j.wav'],
        ['ㄳ', 'g.wav'], ['ㄵ', 'n.wav'], ['ㄶ', 'n.wav'], ['ㄺ', 'l.wav'], ['ㄻ', 'l.wav'],
        ['ㄼ', 'l.wav'], ['ㄽ', 'l.wav'], ['ㄾ', 'l.wav'], ['ㄿ', 'l.wav'], ['ㅀ', 'l.wav'], ['ㅄ', 'b.wav'],

        // 복합 모음
        ['ㅐ', 'a.wav'], ['ㅒ', 'a.wav'], ['ㅔ', 'e.wav'], ['ㅖ', 'e.wav'],
        ['ㅘ', 'o.wav'], ['ㅙ', 'o.wav'], ['ㅚ', 'o.wav'],
        ['ㅝ', 'u.wav'], ['ㅞ', 'u.wav'], ['ㅟ', 'u.wav'], ['ㅢ', 'i.wav'],

        // 추가 특수문자
        ['.', 'default.wav'], [',', 'default.wav'], [';', 'default.wav'], [':', 'default.wav'],
        ["'", 'default.wav'], ['"', 'default.wav'], ['`', 'default.wav'],
        ['-', 'default.wav'], ['_', 'default.wav'], ['+', 'default.wav'], ['=', 'default.wav'],
        ['<', 'default.wav'], ['>', 'default.wav'], ['|', 'default.wav']
    ]);

    private specialKeyMap: Map<string, string> = new Map([
        ['Backspace', 'backspace.wav'], ['ArrowUp', 'arrow_up.wav'],
        ['ArrowDown', 'arrow_down.wav'], ['ArrowLeft', 'arrow_left.wav'],
        ['ArrowRight', 'arrow_right.wav'], ['Tab', 'tab.wav'], ['Enter', 'enter.wav'],
        ['Delete', 'default.wav'], ['Home', 'default.wav'], ['End', 'default.wav'],
        ['PageUp', 'default.wav'], ['PageDown', 'default.wav'], ['Insert', 'default.wav'],
        ['Escape', 'default.wav'], ['F1', 'default.wav'], ['F2', 'default.wav'],
        ['F3', 'default.wav'], ['F4', 'default.wav'], ['F5', 'default.wav'],
        ['F6', 'default.wav'], ['F7', 'default.wav'], ['F8', 'default.wav'],
        ['F9', 'default.wav'], ['F10', 'default.wav'], ['F11', 'default.wav'], ['F12', 'default.wav'],
    ]);


    constructor(private context: vscode.ExtensionContext) {
        this.initializeWebview();
    }

    private initializeWebview() {
        this.webviewPanel = vscode.window.createWebviewPanel(
            'cozyTypingSounds',
            'Cozy Typing Sounds',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'sounds'))],
                retainContextWhenHidden: true
            }
        );

        this.webviewPanel.webview.html = this.getWebviewContent();
        this.webviewPanel.onDidDispose(() => {
            this.webviewPanel = undefined;
        });
    }

    private getAllSoundFiles(): string[] {
        // 모든 사운드 파일을 수집
        const allSounds = new Set<string>();

        // keyToSoundMap에서 모든 파일 추가
        this.keyToSoundMap.forEach(soundFile => allSounds.add(soundFile));

        // specialKeyMap에서 모든 파일 추가
        this.specialKeyMap.forEach(soundFile => allSounds.add(soundFile));

        return Array.from(allSounds);
    }

    private getWebviewContent(): string {
        const soundsUri = this.webviewPanel!.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.context.extensionPath, 'sounds'))
        );

        const allSoundFiles = this.getAllSoundFiles();

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        background: #1e1e1e; 
                        color: white; 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        text-align: center;
                    }
                    .info {
                        margin-top: 50px;
                        opacity: 0.7;
                    }
                </style>
            </head>
            <body>
                <h2>🎵 Cozy Typing Sounds</h2>
                <p>Ready to Play Sounds!</p>
                <div class="info">
                    <p>Typing will play Animal Crossing sound effects!</p>
                    <p>Press Ctrl+Shift+P → "Toggle Cozy Typing Sounds" to turn it on and off.</p>
                </div>
                
                <script>
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const audioBuffers = new Map();
                    
                    // 모든 사운드 파일들
                    const soundFiles = ${JSON.stringify(allSoundFiles)};
                    
                    async function loadSound(filename) {
                        try {
                            const response = await fetch('${soundsUri}/' + filename);
                            if (!response.ok) return;
                            
                            const arrayBuffer = await response.arrayBuffer();
                            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                            audioBuffers.set(filename, audioBuffer);
                        } catch (error) {
                            // 조용히 실패 처리
                        }
                    }
                    
                    // 모든 사운드 파일 로드
                    Promise.all(soundFiles.map(loadSound));
                    
                    function playSound(filename, volume = 0.5) {
                        try {
                            if (audioContext.state === 'suspended') {
                                audioContext.resume();
                            }
                            
                            const audioBuffer = audioBuffers.get(filename);
                            if (!audioBuffer) return;
                            
                            const source = audioContext.createBufferSource();
                            const gainNode = audioContext.createGain();
                            
                            source.buffer = audioBuffer;
                            gainNode.gain.value = volume;
                            
                            source.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            source.start();
                        } catch (error) {
                            // 조용히 실패 처리
                        }
                    }
                    
                    // VS Code 익스텐션과 통신
                    window.addEventListener('message', event => {
                        const { command, soundFile, volume } = event.data;
                        if (command === 'playSound') {
                            playSound(soundFile, volume);
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    public hideWebview() {
        if (this.webviewPanel) {
            // 웹뷰를 숨기지만 dispose하지는 않음
            this.webviewPanel.dispose();
            this.webviewPanel = undefined;
            // 바로 재생성 (백그라운드에서)
            this.initializeWebview();
        }
    }

    private playSound(soundFile: string) {
        if (!this.webviewPanel) {
            console.log('❌ webviewPanel이 없음 - 재초기화 시도');
            this.initializeWebview();
            // 재초기화 후 잠시 기다린 다음 재시도
            setTimeout(() => {
                this.playSound(soundFile);
            }, 100);
            return;
        }

        const config = vscode.workspace.getConfiguration('cozyTypingSounds');
        const volume = Math.min(1.0, Math.max(0.0, config.get<number>('volume', 0.5)));

        this.webviewPanel.webview.postMessage({
            command: 'playSound',
            soundFile: soundFile,
            volume: volume
        });
    }

    // SoundPlayer 클래스 안에 추가
    private isKorean(char: string): boolean {
        const code = char.charCodeAt(0);
        return (code >= 0xAC00 && code <= 0xD7AF); // 한글 완성형 범위
    }

    private decomposeKorean(char: string): string[] {
        const code = char.charCodeAt(0) - 0xAC00;

        const cho = Math.floor(code / 588); // 초성
        const jung = Math.floor((code % 588) / 28); // 중성
        const jong = code % 28; // 종성

        const choList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const jungList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        const jongList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

        const result = [choList[cho], jungList[jung]];
        if (jong > 0) {
            result.push(jongList[jong]);
        }

        return result;
    }

    playCharacterSound(character: string) {
        // 한글 처리
        if (this.isKorean(character)) {
            const decomposed = this.decomposeKorean(character);
            decomposed.forEach((char, index) => {
                setTimeout(() => {
                    const soundFile = this.keyToSoundMap.get(char) || 'default.wav';
                    this.playSound(soundFile);
                }, index * 30); // 한글은 조금 더 느리게
            });
        } else {
            const soundFile = this.keyToSoundMap.get(character.toLowerCase()) || 'default.wav';
            this.playSound(soundFile);
        }
    }

    playSpecialKeySound(keyCode: string) {
        const soundFile = this.specialKeyMap.get(keyCode);
        if (soundFile) {
            this.playSound(soundFile);
        }
    }

    dispose() {
        if (this.webviewPanel) {
            this.webviewPanel.dispose();
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const soundPlayer = new SoundPlayer(context);
    let isEnabled = true;

    const toggleCommand = vscode.commands.registerCommand('cozyTypingSounds.toggle', () => {
        isEnabled = !isEnabled;

        if (!isEnabled) {
            soundPlayer.hideWebview(); // 비활성화 시 웹뷰 숨기기
        }

        vscode.window.showInformationMessage(
            `Cozy Typing Sound ${isEnabled ? 'Enabled' : 'Disabled'}`
        );
    });

    let lastKeyTime = 0;
    let lastDeleteTime = 0;
    const keyThrottleMs = 30;
    const deleteThrottleMs = 100;

    const textChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        const config = vscode.workspace.getConfiguration('cozyTypingSounds');
        const enabled = config.get<boolean>('enabled', true);

        if (!enabled || !isEnabled) return;

        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || event.document !== activeEditor.document) {
            return;
        }

        const excludePatterns = [
            /\.log$/,
            /\.json$/,
            /node_modules/,
            /\.git/,
            /out\//,
            /\.vscode/,
            /extension-output/
        ];

        const filePath = event.document.uri.fsPath;
        if (excludePatterns.some(pattern => pattern.test(filePath))) {
            return;
        }

        const totalChanges = event.contentChanges.reduce((sum, change) => sum + change.text.length, 0);
        if (totalChanges > 10) {
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastKeyTime < keyThrottleMs) return;
        lastKeyTime = currentTime;

        for (const change of event.contentChanges) {

            if (change.text.length > 0) {
                const characters = change.text.split('');

                characters.forEach((char, index) => {
                    setTimeout(() => {
                        if (char === '\n') {
                            soundPlayer.playSpecialKeySound('Enter');
                        } else if (char === '\t') {
                            soundPlayer.playSpecialKeySound('Tab');
                        } else {
                            soundPlayer.playCharacterSound(char);
                        }
                    }, index * 20);
                });

                break;
            } else if (change.rangeLength > 0) {
                const currentTime = Date.now();
                if (currentTime - lastDeleteTime < deleteThrottleMs) return;
                lastDeleteTime = currentTime;

                soundPlayer.playSpecialKeySound('Backspace');
                break;
            }
        }
    });

    context.subscriptions.push(toggleCommand, textChangeListener);
    context.subscriptions.push({ dispose: () => soundPlayer.dispose() });
}

export function deactivate() { }