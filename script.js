{
    delete window.$;
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
    webpackChunkdiscord_app.pop();

    let ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata)?.exports?.Z;
    let RunningGameStore, QuestsStore, ChannelStore, GuildChannelStore, FluxDispatcher, api;

    if(!ApplicationStreamingStore) {
        ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getStreamerActiveStreamMetadata).exports.A;
        RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.Ay?.getRunningGames).exports.Ay;
        QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getQuest).exports.A;
        ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getAllThreadsForParent).exports.A;
        GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Ay?.getSFWDefaultChannel).exports.Ay;
        FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.h?.__proto__?.flushWaitQueue).exports.h;
        api = Object.values(wpRequire.c).find(x => x?.exports?.Bo?.get).exports.Bo;
    } else {
        RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getRunningGames).exports.ZP;
        QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
        ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
        GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
        FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
        api = Object.values(wpRequire.c).find(x => x?.exports?.tn?.get).exports.tn;	
    }

    const renderUI = (current, total, label) => {
        const percent = Math.min(100, Math.floor((current / total) * 100));
        const barSize = 25;
        const completed = Math.round((percent / 100) * barSize);
        const bar = "█".repeat(completed) + "░".repeat(barSize - completed);
        console.clear();
        console.log(`%c[BY: ODEIOFIVEM] %c${label}`, "color: #ff00ea; font-weight: bold; font-size: 12px;", "color: #ffffff");
        console.log(`%c${bar} %c${percent}% [${current}/${total}]`, "color: #5865F2", "color: #ffffff");
        console.log("%c[!] Erros de Overlay abaixo podem ser ignorados. A telemetria segue ativa.", "color: #808080; font-size: 10px;");
    };

    const supportedTasks = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"];
    let quests = [...QuestsStore.quests.values()].filter(x => x.userStatus?.enrolledAt && !x.userStatus?.completedAt && new Date(x.config.expiresAt).getTime() > Date.now() && supportedTasks.find(y => Object.keys((x.config.taskConfig ?? x.config.taskConfigV2).tasks).includes(y)));
    let isApp = typeof DiscordNative !== "undefined";

    if(quests.length === 0) {
        console.log("%c[!] Nenhuma missão pendente encontrada!", "color: #ed4245; font-weight: bold;");
    } else {
        let odeiofivem = function() {
            const quest = quests.pop();
            if(!quest) return;

            const pid = Math.floor(Math.random() * 30000) + 1000;
            const applicationId = quest.config.application.id;
            const applicationName = quest.config.application.name;
            const questName = quest.config.messages.questName;
            const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
            const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);
            const secondsNeeded = taskConfig.tasks[taskName].target;
            let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

            if(taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
                const speed = 7, interval = 1;
                let fn = async () => {			
                    while(true) {
                        const timestamp = secondsDone + speed;
                        await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: Math.min(secondsNeeded, timestamp + Math.random())}});
                        secondsDone = Math.min(secondsNeeded, timestamp);
                        renderUI(secondsDone, secondsNeeded, questName);
                        if(secondsDone >= secondsNeeded) break;
                        await new Promise(resolve => setTimeout(resolve, interval * 1000));
                    }
                    odeiofivem();
                };
                fn();
            } else if(taskName === "PLAY_ON_DESKTOP") {
                if(!isApp) {
                    console.log("Use o App Desktop PTB para missões de Jogo!");
                } else {
                    api.get({url: `/applications/public?application_ids=${applicationId}`}).then(res => {
                        const appData = res.body[0];
                        const exeName = appData.executables.find(x => x.os === "win32").name.replace(">","");
                        const fakeGame = { id: applicationId, name: appData.name, pid: pid, pidPath: [pid], start: Date.now() };
                        
                        const realGetRunningGames = RunningGameStore.getRunningGames;
                        const realGetGameForPID = RunningGameStore.getGameForPID;
                        
                        RunningGameStore.getRunningGames = () => [fakeGame];
                        RunningGameStore.getGameForPID = (p) => p === pid ? fakeGame : undefined;
                        
                        FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: [], added: [fakeGame], games: [fakeGame]});
                        
                        let fn = data => {
                            let prog = data.userStatus.progress?.PLAY_ON_DESKTOP?.value || 0;
                            renderUI(Math.floor(prog), secondsNeeded, questName);
                            if(prog >= secondsNeeded) {
                                RunningGameStore.getRunningGames = realGetRunningGames;
                                RunningGameStore.getGameForPID = realGetGameForPID;
                                FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                                odeiofivem();
                            }
                        };
                        FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                    });
                }
            } else if(taskName === "STREAM_ON_DESKTOP") {
                let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({ id: applicationId, pid, sourceName: null });
                
                let fn = data => {
                    let prog = data.userStatus.progress?.STREAM_ON_DESKTOP?.value || 0;
                    renderUI(Math.floor(prog), secondsNeeded, questName);
                    if(prog >= secondsNeeded) {
                        ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
                        FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                        odeiofivem();
                    }
                };
                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
            } else if(taskName === "PLAY_ACTIVITY") {
                const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
                const streamKey = `call:${channelId}:1`;
                let fn = async () => {
                    while(true) {
                        const res = await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: false}});
                        const prog = res.body.progress.PLAY_ACTIVITY.value;
                        renderUI(prog, secondsNeeded, questName);
                        if(prog >= secondsNeeded) {
                            await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: true}});
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 20 * 1000));
                    }
                    odeiofivem();
                };
                fn();
            }
        };
        odeiofivem();
    }
}
