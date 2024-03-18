/* eslint-disable @typescript-eslint/no-explicit-any */

import fastify from 'fastify';

import CacheProvider from '#lostcity/server/CacheProvider.js';

const app: fastify.FastifyInstance = fastify({ logger: true });
app.get('/clienterror.ws', (req: any, res: any): void => {
    const { c: client, cs: clientSub, u: user, v1: version1, v2: version2, e: error } = req.query;

    console.error(`${client}.${clientSub} - ${user} - ${version1} ${version2}: ${error}`);
    res.send('');
});

app.get('/ms', async (req: any, res: any): Promise<void> => {
    const { m, a: archive, g: group, cb, c: checksum, v: version } = req.query;

    const data: Uint8Array | null = await CacheProvider.getGroup(parseInt(archive), parseInt(group), true);
    if (!data) {
        res.status(404);
        return;
    }

    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-Disposition', `attachment; filename=${archive}_${group}.dat`);
    res.send(data);
});

app.get('/jav_config.ws', (req: any, res: any): void => {
    const { binaryType } = req.query;

    const hostname: string = 'localhost';
    const address: string = `http://${hostname}`;

    const config: Map<string, string> = new Map();
    //
    config.set('title', 'RuneScape');
    config.set('adverturl', `${address}/bare_advert.ws`);
    config.set('codebase', `${address}/`);
    if (binaryType > 0) {
        config.set('server_version', '910');
        config.set('launcher_version', '224');
        config.set('launcher_sub_version', '1');
        config.set('binary_name', 'rs2client.exe');
        config.set('binary_count', '1');
        config.set('download_name_0', 'rs2client.exe');
        config.set('download_crc_0', '');
        config.set('download_hash_0', '');
        config.set('cache_variant_suffix', '');
    } else {
        // config.set('cachedir', 'runescape');
        config.set('storebase', '0');
        config.set('initial_jar', 'gamepack.jar');
        config.set('initial_class', 'Rs2Applet.class');
        config.set('viewerversion', '124');
        config.set('win_sub_version', '1');
        config.set('mac_sub_version', '2');
        config.set('other_sub_version', '2');
        config.set('browsercontrol_win_x86_jar', 'browsercontrol_0_-1928975093.jar');
        config.set('browsercontrol_win_amd64_jar', 'browsercontrol_1_1674545273.jar');
    }
    config.set('download', (Math.random() * 0xFFFFFF >>> 0).toString());
    config.set('termsurl', `${address}/terms/terms.ws`);
    config.set('privacyurl', `${address}/privacy/privacy.ws`);
    //
    config.set('window_preferredwidth', '1024');
    config.set('window_preferredheight', '768');
    config.set('applet_minwidth', '765');
    config.set('applet_minheight', '540');
    config.set('applet_maxwidth', '5670');
    config.set('applet_maxheight', '2160');
    //
    if (binaryType > 0) {
        config.set('loading_image', 'http://www.runescape.com/img/game/splash6.gif');
        config.set('nxt_gpu_drivers_url', `${address}/graphicsDrivers?vendorID=%d`);
    }

    const localization: Map<string, string> = new Map();
    localization.set('lang0', 'English');
    localization.set('lang1', 'Deutsch');
    localization.set('lang2', 'Français');
    localization.set('lang3', 'Português');
    //
    if (binaryType > 0) {
        localization.set('progress_downloading_client', 'Downloading Client...');
        localization.set('nxt_confirm_quit', 'Are you sure you want to quit?');
        localization.set('nxt_bad_version', 'Incorrect Launcher version');
        localization.set('nxt_cannot_move_file', 'Could not move %s');
        localization.set('nxt_cannot_move_file_to_file', 'Could not move %s to %s');
        localization.set('nxt_retry_move_at_exit', 'We will try to move it again when you quit');
        localization.set('nxt_moving_files', 'Moving files to the new location');
        localization.set('nxt_not_enough_space', 'There is not enough space on the target drive to move the files');
        localization.set('nxt_check_security', 'Please ensure that access to %s is not blocked by security permissions and is not already open by another instance of RuneScape');
        localization.set('nxt_single_instance_options', 'You may only change RuneScape Launcher options when a single instance is running');
        localization.set('nxt_graphics_prompt1', 'The RuneScape client suffered from an error');
        localization.set('nxt_graphics_prompt1_init', 'The RuneScape client suffered from an error during graphics initialisation');
        localization.set('nxt_graphics_prompt2', 'This could be due to graphics driver issues and may be improved by switching graphics mode or updating drivers.');
        localization.set('nxt_graphics_prompt3', 'The graphics drivers on your %s are at version %s, which is %s days old.');
        localization.set('nxt_graphics_prompt4', 'You are currently using the %s graphics mode. Would you like to switch to %s instead?');
        localization.set('nxt_graphics_prompt5', 'Alternatively, you may instruct RuneScape to load with default graphics settings the next time it is run.');
        localization.set('nxt_driver_warning_small', 'Your graphics drivers are %d days old.');
        localization.set('nxt_driver_warning', 'The graphics drivers on your %s are at version %s, which is %d days old.');
        localization.set('nxt_driver_update', 'You can update them here.');
        localization.set('nxt_dialog_graphics_mode', 'Graphics Mode');
        localization.set('nxt_dialog_graphics_auto', 'Auto (%s)');
        localization.set('nxt_dialog_graphics_normal', 'Normal Mode');
        localization.set('nxt_dialog_graphics_compat', 'Compatibility Mode');
        localization.set('nxt_use_default', 'Use Default Settings');
        localization.set('nxt_never_ask', 'Do not ask me again');
        localization.set('nxt_button_switch', 'Switch');
        localization.set('new_version', `Update available to the NXT Launcher!\nGet the new version here: ${address}/download`);
        localization.set('new_version_linktext', 'Download Update');
        localization.set('new_version_link', `${address}/download`);
    } else {
        localization.set('err_verify_bc64', 'Unable to verify browsercontrol64');
        localization.set('err_verify_bc', 'Unable to verify browsercontrol');
        localization.set('err_load_bc', 'Unable to load browsercontrol');
        localization.set('err_create_advertising', 'Unable to create advertising');
        localization.set('err_create_target', 'Unable to create target applet');
        localization.set('copy_paste_url', 'Please copy and paste the following URL into your web browser');
    }
    //
    localization.set('tandc', `This game is copyright 1999 - 2019 Jagex Ltd.\nUse of this game is subject to our ["${address}/terms/terms.ws"Terms and Conditions] and ["${address}/privacy/privacy.ws"Privacy Policy].`);
    localization.set('options', 'Options');
    localization.set('language', 'Language');
    localization.set('changes_on_restart', 'Your changes will take effect when you next start this program.');
    localization.set('loading_app_resources', 'Loading application resources');
    localization.set('loading_app', 'Loading application');
    localization.set('err_save_file', 'Error saving file');
    localization.set('err_downloading', 'Error downloading');
    localization.set('ok', 'OK');
    localization.set('cancel', 'Cancel');
    localization.set('message', 'Message');
    localization.set('information', 'Information');
    localization.set('err_get_file', 'Error getting file');

    const params: Map<string, string> = new Map();
    params.set('1', '');
    params.set('2', 'false');
    params.set('3', '0');
    params.set('5', 'false');
    if (binaryType > 0) {
        params.set('6', 'QXXxI6194DN8KL4pw19GwFOlYxcpTgTT'); // token
    } else {
        params.set('6', 'Rxl4woCZsjcFFBT6wt6lwbrHiydCjdD8'); // token
    }
    params.set('7', 'false');
    params.set('8', '43594');
    params.set('9', '577552940');
    params.set('10', `.${hostname}`);
    params.set('11', '1449949008'); // dynamic
    params.set('12', '43594');
    params.set('13', '');
    params.set('14', hostname);
    params.set('16', '');
    params.set('17', '52357'); // dynamic
    params.set('18', `${address}/operator/v1/`);
    params.set('19', '443');
    params.set('20', '110');
    params.set('22', `${address}/`);
    params.set('23', hostname);
    params.set('24', '0');
    params.set('25', '-1713613243'); // dynamic
    params.set('26', '0');
    params.set('27', '0');
    params.set('28', `${address}/`);
    params.set('29', '43594');
    params.set('30', '443');
    params.set('31', 'true');
    params.set('32', '1200');
    params.set('33', 'false');
    params.set('34', '0');
    params.set('35', 'wwGlrZHF5gKN6D3mDdihco3oPeYN2KFybL9hUUFqOvk'); // dynamic?
    params.set('36', '0');
    params.set('37', `${address}/m=gamelogspecs/clientstats?data=`);
    params.set('38', `${address}/`);
    params.set('39', '0');
    params.set('40', 'halign=true|valign=true|image=rs_logo.gif,0,-43|rotatingimage=rs3_loading_spinner.gif,0,47,9.6|progress=true,Verdana,13,0xFFFFFF,0,51');
    params.set('41', '443');
    params.set('42', 'true');
    params.set('43', hostname);
    params.set('44', '80');
    params.set('45', '0');
    params.set('46', '0');
    params.set('47', '');
    params.set('48', ''); // googleusercontent.com
    params.set('49', 'false');
    params.set('50', '11'); // dynamic
    params.set('51', '');
    params.set('52', 'false');
    params.set('53', '443');
    params.set('54', '1133'); // dynamic
    params.set('55', 'false');
    params.set('56', `${hostname}/`); // jxp.aws?
    if (!(binaryType > 0)) {
        params.set('java_arguments', '-Xmx384m -Xss2m -Dsun.java2d.noddraw=true -XX:CompileThreshold=1500 -Xincgc -XX:+UseConcMarkSweepGC -XX:+UseParNewGC');
        params.set('haveie6', 'true');
        params.set('gamepack', 'gamepack.jar  code=Rs2Applet.class');
        params.set('centerimage', 'true');
        params.set('image', `${address}/img/game/splash6.gif`);
        params.set('separate_jvm', 'true');
        params.set('boxbgcolor', 'black');
        params.set('boxborder', 'false');
    }

    // combine all maps into a string separated key=value pairs
    let jav: string = '';
    for (const [key, value] of config) {
        jav += `${key}=${value}\n`;
    }
    for (const [key, value] of localization) {
        jav += `${key}=${value}\n`;
    }
    for (const [key, value] of params) {
        jav += `param=${key}=${value}\n`;
    }

    res.send(jav);
});

app.get('/client', (req: any, res: any): void => {
    const { binaryType, fileName, crc } = req.query;

    res.send('');
});

export default async function startWeb(): Promise<void> {
    await CacheProvider.load('data/pack');
    CacheProvider.watch('data/pack');

    app.listen({
        port: 80,
        host: '0.0.0.0'
    });
}
