/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'util/url',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'text!cbaIbPci/test/pciCbaIb/data/likert_triple/qti.xml'
], function ($, _, url, assetManagerFactory, assetStrategies, portableAssetStrategy, qtiItemRunner, ciRegistry, pciTestProvider, likertTripleXml) {

    'use strict';

    var fixtureContainerId = 'inner-container';
    var outerContainerId = 'outer-container';

    function getAssetManager(baseUrl) {
        return assetManagerFactory([
            assetStrategies.external,
            assetStrategies.baseUrl,
            portableAssetStrategy
        ], {baseUrl: baseUrl || ''});
    }

    function parseXml(xml) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                    url: url.route('getJson', 'Parser', 'taoQtiItem'),
                    type: 'POST',
                    contentType: 'text/xml',
                    dataType: 'json',
                    data: xml
                })
                .done(function (response) {
                    return resolve(response.itemData);
                })
                .fail(function (xhr) {
                    return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                });
        });
    }

    /**
     * manually register the pci from its manifest
     */
    pciTestProvider.addManifestPath('pciCbaIb', 'cbaIbPci/pciCreator/pciCbaIb/pciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    /**
     * Test if all rendering elements are in place
     */
    QUnit.test('renders correctly', function (assert) {
        var ready = assert.async();
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/cbaIbPci/views/js/test/pciCbaIb/data/likert_triple/');
            var runner = qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {

                    assert.equal($container.children().length, 1, 'the container a elements');
                    assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                    assert.equal($container.find('.qti-interaction').length, 3, 'the container contains 3 interactions .qti-interaction');
                    assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 3, 'the container contains 3 custom interactions');
                    assert.equal($container.find('.qti-customInteraction .pciCbaIb').length, 3, 'the container contains 3 likert interactions');
                    assert.equal($container.find('.qti-customInteraction .prompt').length, 3, 'the interaction contains 3 prompts');

                    ready();
                    runner.clear();
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        });
    });

    /**
     * Test test taker interaction and the obtained response
     */
    QUnit.test('response', function (assert) {
        var ready = assert.async();
        var $container = $('#' + outerContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/cbaIbPci/views/js/test/pciCbaIb/data/likert_triple/');
            var runner = qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {

                    var self = this;

                    //simulate a click to the third choice of the second PCI
                    $('input:radio[name=likert2]').get(2).click();

                    _.defer(function(){
                        assert.equal($('input:radio[name=likert1]:checked').val(), undefined, 'likert 1 state untouched');
                        assert.equal($('input:radio[name=likert2]:checked').val(), '3', 'likert 2 state set');
                        assert.equal($('input:radio[name=likert3]:checked').val(), undefined, 'likert 3 state untouched');

                        // assert.deepEqual(self.getResponses(), {
                        //     likert1: {
                        //         base: {
                        //             integer: 0
                        //         }
                        //     },
                        //     likert2: {
                        //         base: {
                        //             integer: 3
                        //         }
                        //     },
                        //     likert3: {
                        //         base: {
                        //             integer: 0
                        //         }
                        //     }
                        // }, 'state ok');

                        ready();
                        runner.clear();
                    });
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        });
    });

    /**
     * Test the state recovery, essential behaviour when navigating the test flow
     */
    QUnit.test('state', function (assert) {
        var ready = assert.async();
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/cbaIbPci/views/js/test/pciCbaIb/data/likert_triple/');
            var runner = qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {

                    var self = this;

                    this.setState({
                        likert1: {response: {base: {integer: 1}}},
                        likert2: {response: {base: {integer: 3}}}
                    });

                    _.delay(function(){
                        assert.equal($('input:radio[name=likert1]:checked').val(), '1', 'likert 1 state set');
                        assert.equal($('input:radio[name=likert2]:checked').val(), '3', 'likert 2 state set');
                        assert.equal($('input:radio[name=likert3]:checked').val(), undefined, 'likert 3 state untouched');

                        // assert.deepEqual(self.getState(), {
                        //     likert1: {response: {base: {integer: 1}}},
                        //     likert2: {response: {base: {integer: 3}}},
                        //     likert3: {response: {base: {integer: 0}}},
                        // }, 'state ok');

                        ready();
                        runner.clear();
                    }, 100);
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        });
    });

    /**
     * Offer a way to visually test the interaction
     */
    QUnit.test('display and play', function (assert) {
        var ready = assert.async();
        var $container = $('#' + outerContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/cbaIbPci/views/js/test/pciCbaIb/data/likert_triple/');
            qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {
                    this.setState({
                        likert1: {response: {base: {integer: 1}}},
                        likert2: {response: {base: {integer: 3}}}
                    });
                    ready();
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        });
    });

});

