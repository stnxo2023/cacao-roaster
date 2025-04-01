import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type EventBus from 'diagram-js/lib/core/EventBus';
import CacaoUtils from '../../core/CacaoUtils';
import type PlaybookHandler from '../../model/PlaybookHandler';
import type CacaoExporter from '../exporter/CacaoExporter';
import Soarca from '../integrations/soarca/Soarca';
import type CacaoModeling from '../modeling/CacaoModeling';
import type CacaoSidePanel from '../side-panel/CacaoSidePanel';
import type CacaoSigning from '../signing/CacaoSigning';

type HeaderOptionEntry = {
	action: (event: any) => void;
	className: string;
	title: string;
};

export default class CacaoHeader {
	private _playbookHandler: PlaybookHandler;
	private _cacaoExporter: CacaoExporter;
	private _cacaoSidePanel: CacaoSidePanel;
	private _cacaoSigning: CacaoSigning;
	private _elementRegistry: ElementRegistry;
	private _cacaoModeling: CacaoModeling;
	private _soarcaIntegration: Soarca;

	private _headerContainer!: HTMLElement;
	private _headerName!: HTMLElement;
	private _headerDescription!: HTMLElement;
	private _headerOptions!: HTMLElement;
	private _headerTags!: HTMLElement;
	private _headerLabels!: HTMLElement;
	private _LabelsList!: HTMLElement[];
	private _LabelsMoreIndicator!: HTMLElement;

	private _headerPreviousSize = 0;

	static $inject: string[];

	constructor(
		playbookHandler: PlaybookHandler,
		tabContainer: HTMLElement,
		eventBus: EventBus,
		cacaoExporter: CacaoExporter,
		cacaoSidePanel: CacaoSidePanel,
		cacaoSigning: CacaoSigning,
		elementRegistry: ElementRegistry,
		cacaoModeling: CacaoModeling,
	) {
		this._cacaoExporter = cacaoExporter;
		this._playbookHandler = playbookHandler;
		this._cacaoSidePanel = cacaoSidePanel;
		this._cacaoSigning = cacaoSigning;
		this._elementRegistry = elementRegistry;
		this._cacaoModeling = cacaoModeling;
		this._soarcaIntegration = new Soarca(playbookHandler);

		this.initHeader(tabContainer);

		eventBus.on(
			['elements.changed', 'diagram.init', 'playbook.changed', 'editor.loaded'],
			() => {
				this.updateName();
				this.updateTags();
				this.updateLabels();
				this.loadHeaderOptionEntries();
			},
		);
		this.updateName();
		this.updateTags();
		this.updateLabels();
	}

	/**
	 * this method can be trigger to update the displayed title
	 */
	private updateName() {
		let playbookName = this._playbookHandler.getPlaybookProperties('name');
		let playbookDescription = this._playbookHandler.getPlaybookProperties('description');

		if (!this._headerName || !this._headerDescription) {
			throw new Error('div with these id MUST be defined : header-name, header-description');
		}
		if (playbookName === '') {
			playbookName = '';
		}

		if (playbookDescription === '') {
			playbookDescription = '';
		}
		this._headerName.innerHTML = playbookName;
		this._headerDescription.innerHTML = playbookDescription;
		this._headerDescription.title = playbookDescription;
	}

	/**
	 * this method can be trigger to update the tags
	 */
	private updateTags() {
		const revoked = this._playbookHandler.playbook.revoked ?? false;
		const cacao2_0 = this._playbookHandler.playbook.spec_version;
		const tlp: string = this._playbookHandler.getTLPMarking();

		this._headerTags.innerHTML = '';

		if (cacao2_0) {
			const cacaoTag = document.createElement('div');
			cacaoTag.className = 'tag cacao-spec-version';
			cacaoTag.innerText = cacao2_0;
			this._headerTags.appendChild(cacaoTag);
		}

		if (revoked) {
			const revokedTag = document.createElement('div');
			revokedTag.className = 'tag revoked-tag';
			revokedTag.innerText = 'revoked';
			this._headerTags.appendChild(revokedTag);
		}

		if (tlp !== '') {
			const tlpTag = document.createElement('div');
			tlpTag.className = `${tlp.replace(/[:+]/g, '-').toLowerCase()}-tag tlp-tag tag`;
			tlpTag.innerText = tlp;
			this._headerTags.appendChild(tlpTag);
		}
	}
	/**
	 *
	 *  - class::header
	 *      - class::header__title
	 *          - class::title__name
	 *          - class::title__tags
	 *          - class::title__description
	 *      - class::header__options-container
	 *          - class:header-option
	 * @param container the HTMLElement that represents the header container
	 */
	private initHeader(container: HTMLElement) {
		this._headerContainer = document.createElement('div');
		this._headerContainer.className = 'header';

		const headerLogoContainer = document.createElement('div');
		headerLogoContainer.className = 'header__logo';

		const headerTitleContainer = document.createElement('div');
		headerTitleContainer.className = 'header__title';

		this._headerName = document.createElement('div');
		this._headerName.className = 'title__name';

		this._headerTags = document.createElement('div');
		this._headerTags.className = 'title__tags';

		const linefeed = document.createElement('div');
		linefeed.className = 'expanded';

		this._headerLabels = document.createElement('div');
		this._headerLabels.className = 'title__labels expanded';
		this._LabelsMoreIndicator = document.createElement('div');
		this._LabelsMoreIndicator.className = 'labels__entry labels__moreindicator';

		this._headerDescription = document.createElement('div');
		this._headerDescription.className = 'title__description expanded';

		this._headerOptions = document.createElement('div');
		this._headerOptions.className = 'header__options';

		container.insertBefore(this._headerContainer, container.firstChild);
		this._headerContainer.appendChild(headerLogoContainer);
		this._headerContainer.appendChild(headerTitleContainer);
		headerTitleContainer.appendChild(this._headerName);
		headerTitleContainer.appendChild(this._headerTags);
		headerTitleContainer.appendChild(linefeed);
		headerTitleContainer.appendChild(this._headerDescription);
		headerTitleContainer.appendChild(this._headerLabels);
		this._headerContainer.appendChild(this._headerOptions);
		this.loadHeaderOptionEntries();
	}

	/**
	 * this method update the list of label display as a list in the header
	 * @returns
	 */
	updateLabels() {
		this._headerLabels.innerHTML = '';
		this._LabelsList = [];

		const createEntry = (name: string): HTMLElement => {
			const label = document.createElement('div');
			label.innerText = name;
			label.className = 'labels__entry';
			return label;
		};

		const labelList = this._playbookHandler?.playbook?.labels;

		if (!labelList) {
			return;
		}

		for (const label of labelList) {
			const entry = createEntry(label);
			this._LabelsList.push(entry);
			this._headerLabels.appendChild(entry);
		}

		const update = () => {
			let hideNext: undefined | HTMLElement = undefined;
			let countHide = 0;
			for (const label of this._LabelsList) {
				if (label.offsetLeft + label.offsetWidth > this._headerLabels.offsetWidth - 70) {
					label.style.visibility = 'hidden';
					if (!hideNext) {
						hideNext = label;
					}
					countHide++;
				} else {
					label.style.visibility = 'visible';
				}
				this._LabelsMoreIndicator.innerHTML = `${countHide} more`;
				if (hideNext) {
					this._LabelsMoreIndicator.classList.remove('moreindicator--hide');
					this._LabelsMoreIndicator.classList.add('moreindicator--show');
					this._LabelsMoreIndicator.remove();
					this._headerLabels.insertBefore(this._LabelsMoreIndicator, hideNext);
				} else {
					this._LabelsMoreIndicator.classList.remove('moreindicator--show');
					this._LabelsMoreIndicator.classList.add('moreindicator--hide');
					this._LabelsMoreIndicator.remove();
				}
			}
		};

		window.onresize = update;
		update();
	}

	/**
	 * this method load all the action entries of the header
	 */
	private loadHeaderOptionEntries() {
		const entries: HeaderOptionEntry[] = [
			{
				title: 'EXPANDED MODE',
				className: this._cacaoModeling.isExpandedMode() ? 'expander expanded' : 'expander',
				action: () => {
					for (const element of this._elementRegistry.getAll()) {
						if (CacaoUtils.isConstructType(element?.type)) {
							this._cacaoModeling.toggleCollapse(element as any);
						}
					}
					if (this._cacaoModeling.isExpandedMode()) {
						this._headerOptions
							.getElementsByClassName('expander')[0]
							?.classList.add('expanded');
					} else {
						this._headerOptions
							.getElementsByClassName('expander')[0]
							?.classList.remove('expanded');
					}
				},
			},
			{
				title: 'VERIFY',
				className: 'verify',
				action: () => {
					this._cacaoSigning.showSignatureCheckDialog();
				},
			},
			{
				title:
					this._cacaoSigning.canUserSignOrCounterSignPlaybook() === 'sign'
						? 'SIGN'
						: 'COUNTER- SIGN',
				className:
					this._cacaoSigning.canUserSignOrCounterSignPlaybook() === 'sign'
						? 'sign'
						: 'sign countersign',
				action: async () => {
					this._cacaoSigning.signOrCountersignPlaybook();
				},
			},
			{
				title: 'METADATA',
				className: 'metadata',
				action: () => {
					this._cacaoSidePanel.openMetadataPanel();
				},
			},
		];
		this._headerOptions.innerHTML = '';
		this._integrationsDropDownButton();
		this._exportOptionsDropDownButton();
		for (const entry of entries) {
			this.createEntry(entry, this._headerOptions);
		}
	}

	private _exportOptionsDropDownButton() {
		// Dropdown content container
		const dropdownContent = document.createElement('div');
		dropdownContent.classList.add('dropdown-content');

		/* Dropdown items */
		// Export STIX 2.1 JSON
		const dropdownItem1 = this._createDropdownItem(
			'export_stix-2-1-icon',
			'STIX 2.1 JSON',
			() => this._cacaoExporter.openExportPreferencesDialog('STIX 2.1 JSON'),
		);

		// Export CACAO JSON
		const dropdownItem2 = this._createDropdownItem('export_cacao-json-icon', 'CACAO JSON', () =>
			this._cacaoExporter.openExportPreferencesDialog('CACAO JSON'),
		);

		// Export SVG
		const dropdownItem3 = this._createDropdownItem('export_svg-icon', 'SVG', () =>
			this._cacaoExporter.exportToSVG(),
		);

		// Adding dropdown items to the dropdown content
		dropdownContent.appendChild(dropdownItem2);
		dropdownContent.appendChild(dropdownItem3);
		dropdownContent.appendChild(dropdownItem1);

		// Dropdown Icon in the header menu
		const entryIcon = document.createElement('div');
		entryIcon.classList.add('entry__icon');
		// Dropdown Label in the header menu
		const entryLabel = document.createElement('p');
		entryLabel.classList.add('entry__label');
		entryLabel.innerText = 'EXPORT OPTIONS';

		// Creating a dropdown "button" with icon and label
		const dropdownButton = document.createElement('div');
		dropdownButton.appendChild(entryIcon);
		dropdownButton.appendChild(entryLabel);

		// Assesmbling the dropdown
		const dropdown = document.createElement('div');
		dropdown.classList.add('export', 'options__entry', 'dropdown');
		dropdown.appendChild(dropdownButton);
		dropdown.appendChild(dropdownContent);

		// Adding the dropdown to the header options
		this._headerOptions.appendChild(dropdown);
	}

	private _createDropdownItem(id: string, label: string, action: CallableFunction) {
		const dropdownItem1 = document.createElement('div');
		const item1Icon = document.createElement('span');
		item1Icon.classList.add('dropdown-item-icon');
		item1Icon.id = id;
		const item1Label = document.createElement('p');
		item1Label.innerText = label;
		dropdownItem1.appendChild(item1Icon);
		dropdownItem1.appendChild(item1Label);
		dropdownItem1.addEventListener('click', () => {
			action();
		});
		return dropdownItem1;
	}

	private _integrationsDropDownButton() {
		// Dropdown content container
		const dropdownContent = document.createElement('div');
		dropdownContent.classList.add('dropdown-content');

		/* Dropdown item */
		// SOARCA integration
		const dropdownItem = this._createDropdownItem('integration_soarca-icon', 'SOARCA', () => {
			this._soarcaIntegration.showDialog();
		});

		// Adding dropdown item to the dropdown content
		dropdownContent.appendChild(dropdownItem);

		// Dropdown Icon in the header menu
		const entryIcon = document.createElement('div');
		entryIcon.classList.add('entry__icon');
		// Dropdown Label in the header menu
		const entryLabel = document.createElement('p');
		entryLabel.classList.add('entry__label');
		entryLabel.innerText = 'INTEGRATIONS';

		// Creating a dropdown "button" with icon and label
		const dropdownButton = document.createElement('div');
		dropdownButton.classList.add('flex-column-center');
		dropdownButton.appendChild(entryIcon);
		dropdownButton.appendChild(entryLabel);

		// Assesmbling the dropdown
		const dropdown = document.createElement('div');
		dropdown.classList.add('integrations', 'options__entry', 'dropdown');
		dropdown.appendChild(dropdownButton);
		dropdown.appendChild(dropdownContent);

		// Adding the dropdown to the header options
		this._headerOptions.appendChild(dropdown);
	}

	/**
	 * create the html corresponding to an entry of the header
	 * @param entry
	 * @param container
	 */
	private createEntry(entry: HeaderOptionEntry, container: HTMLElement) {
		const button = document.createElement('div') as HTMLDivElement;
		button.className = entry.className;
		button.classList.add('options__entry');
		button.innerHTML = `
        <div class="entry__icon"></div>
        <p class="entry__label">${entry.title}</p>
        `;
		button.onclick = (event: any) => {
			this._cacaoSidePanel.confirmAndClosePanel();
			entry.action(event);
		};
		container.appendChild(button);
	}
}

CacaoHeader.$inject = [
	'playbookHandler',
	'config.container',
	'eventBus',
	'cacaoExporter',
	'cacaoSidePanel',
	'cacaoSigning',
	'elementRegistry',
	'modeling',
];
