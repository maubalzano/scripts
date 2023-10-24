if (withdraw_filter) end(); var withdraw_filter = true; let url = window.location.href; if (!url.includes('screen=info_village&id=')) { if (url.includes('screen=')) { let placeUrl = url.split('screen=')[0] + `screen=info_village&id=${TribalWars.getGameData().village.id}`; window.location.href = placeUrl } else { let placeUrl = url + `screen=info_village&id=${TribalWars.getGameData().village.id}`; window.location.href = placeUrl } } else {
    var groups = [];
    var groupsMap = new Map();
    var currentGroup;
    $('#withdraw_selected_units_village_info table').hide();
    $('#withdraw_selected_units_village_info').append('<div id="loading_groups"style="width:100%;padding:10px;text-align:center"><img src="https://dsit.innogamescdn.com/asset/c38e8d7e/graphic/loading.gif"style="display: inline;"></div>');
    TribalWars.get("groups", {
        ajax: "load_groups"
    }, function ({ result }) {
        groups = result;
        $('#withdraw_selected_units_village_info').prepend('<div class="vis_item"align="center"id="group-list"></div>');
        groups.forEach(g => $('#group-list').append(`<a class="group-menu-item"style="cursor:pointer;margin-inline:2px"group-id="${g.group_id}">[${g.name}] </a>`));
        Promise.allSettled(groups.map((g, i) => {
            return new Promise((res, rej) => {
                setTimeout(() => {
                    TribalWars.post("groups", {
                        ajax: "load_villages_from_group"
                    }, {
                        group_id: g.group_id
                    }, function (result) {
                        let html = result.html;
                        html = jQuery.parseHTML(html);
                        let villages = [];
                        $(html).find('[data-village-id]').each(function () {
                            villages.push($(this).data('village-id'));
                        });
                        groupsMap.set(g.group_id, villages);
                        res(true);
                    });
                }, 100 * (i));
            });

        })).then(() => {
            console.log('Filtra Supporti by mauro.buio. 🚀 Ready to go...');
            $('#withdraw_selected_units_village_info table').show();
            $('#withdraw_selected_units_village_info #loading_groups').remove();
            $('#withdraw_selected_units_village_info').prepend('<div style="width:100%;padding:10px;text-align:center">Filtra Supporti by mauro.buio. 🚀 Ready to go...</div>')
            $('.group-menu-item').each(function () {
                $(this).click(function (el) {
                    currentGroup = $(this).attr('group-id');
                    $('.group-menu-item').each(function () { $(this).css('color', '#603000') });
                    $(this).css('color', 'blue');
                    $('#withdraw_selected_units_village_info tr input[type="checkbox"][name^="withdraw"]').each(function (i, el) {
                        if (this.name && this.name.includes('home')) {
                            let id = this.name.split('[home]')[1].replace('[', '').replace(']', '');
                            if (!groupsMap.get(currentGroup)?.find(v => v == id)) {
                                $(this).prop('checked', false);
                                $(this).prop('disabled', true);
                                $(this).parent().parent().hide();
                            } else {
                                $(this).prop('disabled', false);
                                $(this).parent().parent().show();
                            };
                        };
                    });
                });
            });
        });
    });
    $('#withdraw_selected_units_village_info th:contains(Provenienza)').append('<div><label>Solo i propri</label><input type="checkbox" id="only_own" form="null"></div>');
    $('input#only_own').change(function () {
        let checked = this.checked;
        $('#withdraw_selected_units_village_info tr input[name^="send_back"]').each(function () {
            if (checked) {
                $(this).prop('checked', false);
                $(this).prop('disabled', true);
                $(this).parent().parent().hide();
            }
            else {
                $(this).prop('disabled', false);
                $(this).parent().parent().show();
            };
        });
    });
    $('.unit-item').each(function () {
        let val = $(this).html() ?? 0;
        $(this).attr('val', val);
        var obs = new MutationObserver(function (mutations) {
            let unit = mutations[0].target.id;
            if (!$(`#enable-${unit}`).prop('checked')) {
                $(mutations[0].target).find('input').prop('disabled', true);
            }
        });
        obs.observe($(this)[0], { characterData: true, attributes: true });
    });

    $('#withdraw_selected_units_village_info th a[data-unit]').each(function (el) {
        let unit = $(this).data('unit');
        let input = $(`<input type="checkbox" id="enable-${unit}" form="null" checked>`).insertAfter(this);
        input.change(function () {
            let checked = this.checked;
            $('#withdraw_selected_units_village_info tr input[name^="withdraw"]').each(function (i, input) {
                $(this).parent().parent().find(`#${unit}.unit-item-${unit}`).each(function (i, td) {
                    let hasInput = $(this).hasClass('has-input');
                    if (!checked) {
                        $(this).addClass('hidden');
                        if (hasInput) {
                            $(this).find('input').prop('disabled', true);
                        };
                    } else {
                        if (hasInput) {
                            $(this).find('input').prop('disabled', false);
                        };
                        $(this).removeClass('hidden');
                    };
                });
            });
        });
    });
}