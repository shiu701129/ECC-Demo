import { Button, ChevronStartIcon, Flex, FormInput, Loader } from "@fluentui/react-northstar";
import { Client } from "@microsoft/microsoft-graph-client";
import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import CommonService from "../common/CommonService";
import * as constants from "../common/Constants";
import * as graphConfig from "../common/graphConfig";
import siteConfig from "../config/siteConfig.json";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import "../scss/ChannelTemplate.module.scss";
import ChannelSetting from "./ChannelSetting";

interface IInputValidationStates {
  templateNameHasError: boolean;
  templateNameErrorMsg: string;
  channelNameHasError: boolean;
  channelNameErrorMsg: string;
}

export interface IWebTabInfo {
  name: string;
  url: string;
}

export interface ICusAppTabInfo {
  name: string;
  appId: string;
  contentUrl: string;
}

export interface IChannelInfo {
  name: string;
  newsTab: boolean;
  assessmentTab: boolean;
  plannerTab: boolean;
  webTabList: IWebTabInfo[];
  cusAppList: ICusAppTabInfo[];
}

export interface ITemplateInfo {
  itemId: string;
  title: string;
  isAdd: boolean;
  isEdit: boolean;
  isDel: boolean;
  setting: IChannelInfo[];
}

interface IChannelTemplateProps {
  graph: Client;
  tenantName: string;
  siteId: string;
  onBackClick(showMessageBar: boolean): void;
  showMessageBar(message: string, type: string): void;
  hideMessageBar(): void;
  localeStrings: any;
  currentUserId: string;
  appInsights: ApplicationInsights;
  userPrincipalName: any;
}

interface IChannelTemplateState {
  dropdownOptions: any;
  showLoader: boolean;
  loaderMessage: string;
  isDesktop: boolean;
  formOpacity: number;
  iptValidation: IInputValidationStates;
  templateList: ITemplateInfo[];
  selTemplateItem: ITemplateInfo;
  selChannelItem: IChannelInfo;
  iptTemplateName: string;
  iptChannelName: string;
  showChannelSetting: boolean;
}

const getInitInputValidation = () => {
  return {
    templateNameHasError: false,
    templateNameErrorMsg: "",
    channelNameHasError: false,
    channelNameErrorMsg: "",
  };
};

const getInitTemplateItem = () => {
  return {
    itemId: "",
    title: "",
    isAdd: false,
    isEdit: false,
    isDel: false,
    setting: [],
  };
};

const getInitChannelItem = () => {
  return {
    name: "",
    newsTab: false,
    assessmentTab: false,
    plannerTab: false,
    webTabList: [],
    cusAppList: [],
  };
};

class ChannelTemplate extends React.PureComponent<IChannelTemplateProps, IChannelTemplateState> {
  constructor(props: IChannelTemplateProps) {
    super(props);

    this.state = {
      dropdownOptions: "",
      showLoader: true,
      loaderMessage: this.props.localeStrings.genericLoaderMessage,
      isDesktop: true,
      formOpacity: 0.5,
      iptValidation: getInitInputValidation(),
      templateList: [],
      selTemplateItem: getInitTemplateItem(),
      selChannelItem: getInitChannelItem(),
      iptTemplateName: "",
      iptChannelName: "",
      showChannelSetting: false,
    };

    this.onTextInputChange = this.onTextInputChange.bind(this);
    this.onSelTemplate = this.onSelTemplate.bind(this);
    this.onAddTemplate = this.onAddTemplate.bind(this);
    this.onDelTemplate = this.onDelTemplate.bind(this);
    this.onAddChannel = this.onAddChannel.bind(this);
    this.onDelChannel = this.onDelChannel.bind(this);
    this.onChannelSettingSave = this.onChannelSettingSave.bind(this);
    this.onUpdateTemplate = this.onUpdateTemplate.bind(this);
  }

  private dataService = new CommonService();
  private graphEndpoint = "";

  //get all master data and check for edit mode or new record
  public async componentDidMount() {
    // console.log(constants.infoLogPrefix + "componentDidMount");
    await this.getChannelTemplate();
    //Event listener for screen resizing
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  //Function for screen Resizing
  resize = () => this.setState({ isDesktop: window.innerWidth > constants.mobileWidth });

  // public componentDidUpdate(prevProps: IChannelTemplateProps, prevState: IChannelTemplateState) {
  //   console.log(constants.infoLogPrefix + "componentDidUpdate");
  //   if (
  //     prevState.selectedUsersInEditMode !== this.state.selectedUsersInEditMode ||
  //     prevState.selectedIncidentCommander !== this.state.selectedIncidentCommander
  //   ) {
  //     this.updatePeoplePickerRole();
  //   }
  // }

  componentWillUnmount() {
    // console.log(constants.infoLogPrefix + "componentWillUnmount");
    //Event listener for screen resizing
    window.removeEventListener("resize", this.resize.bind(this));
  }

  private getChannelTemplate = async () => {
    try {
      const channelTemplateGraphEndpoint = `${graphConfig.spSiteGraphEndpoint}${this.props.siteId}${graphConfig.listsGraphEndpoint}/${siteConfig.channelTemplateList}/items?$expand=fields&$Top=5000`;

      let templateList = await this.dataService.getChannelTemplateData(
        channelTemplateGraphEndpoint,
        this.props.graph
      );

      this.setState({
        templateList: templateList,
        showLoader: false,
        formOpacity: 1,
      });
    } catch (error) {
      console.error(
        constants.errorLogPrefix + "ChannelTemplate_getChannelTemplate \n",
        JSON.stringify(error)
      );
      // Log Exception
      this.dataService.trackException(
        this.props.appInsights,
        error,
        constants.componentNames.ChannelTemplateComponent,
        "ChannelTemplate_getChannelTemplate",
        this.props.userPrincipalName
      );
    }
  };

  // on change handler for text input changes
  private onTextInputChange = (event: any, key: string) => {
    let iptValue = event.target.value ? event.target.value : "";
    let iptValidation = this.state.iptValidation;

    switch (key) {
      case "templateName":
        iptValidation.templateNameErrorMsg = "";
        if (iptValue.length > 0) {
          iptValidation.templateNameHasError = false;
          this.setState({
            iptTemplateName: iptValue.trim(),
            iptValidation: iptValidation,
          });
        } else {
          iptValidation.templateNameHasError = true;
          this.setState({
            iptTemplateName: "",
            iptValidation: iptValidation,
          });
        }
        break;
      case "channelName":
        iptValidation.channelNameErrorMsg = "";
        if (iptValue.length > 0) {
          iptValidation.channelNameHasError = false;
          this.setState({
            iptChannelName: iptValue.trim(),
            iptValidation: iptValidation,
          });
        } else {
          iptValidation.channelNameHasError = true;
          this.setState({
            iptChannelName: "",
            iptValidation: iptValidation,
          });
        }
        break;
      default:
        break;
    }
  };

  private onSelTemplate = (index: number) => {
    let templateList = this.state.templateList;

    this.setState({
      selTemplateItem: templateList[index],
    });
  };

  private onAddTemplate = () => {
    let templateName = this.state.iptTemplateName;
    let templateList = this.state.templateList;
    let iptValidation = getInitInputValidation();

    if (!templateName || templateName.length === 0) {
      iptValidation.templateNameHasError = true;
      iptValidation.templateNameErrorMsg = "";

      this.setState({
        iptValidation: iptValidation,
      });
    } else {
      let existItem = templateList.filter((item: ITemplateInfo) => item.title === templateName);

      if (existItem.length > 0) {
        iptValidation.templateNameHasError = true;
        iptValidation.templateNameErrorMsg = this.props.localeStrings.duplicateName;

        this.setState({
          iptValidation: iptValidation,
        });
      } else {
        let template = getInitTemplateItem();
        template.title = templateName;
        template.isAdd = true;
        templateList.push(template);

        this.setState({
          iptValidation: iptValidation,
          iptTemplateName: "",
          templateList: templateList,
        });
      }
    }
  };

  private onDelTemplate = (index: number) => {
    let templateList = this.state.templateList;
    let selTemplateItem = this.state.selTemplateItem;

    if (selTemplateItem.title === templateList[index].title) {
      selTemplateItem = getInitTemplateItem();
    }

    if (templateList[index].isAdd) {
      templateList = templateList.splice(index, 1);
    } else {
      templateList[index].isDel = true;
      templateList[index].isEdit = false;
    }

    this.setState({
      selTemplateItem: selTemplateItem,
      templateList: [...templateList],
    });
  };

  private onAddChannel = () => {
    let channelName = this.state.iptChannelName;
    let channelList = this.state.selTemplateItem.setting;

    let iptValidation = getInitInputValidation();
    if (!this.state.selTemplateItem || this.state.selTemplateItem.title === "") {
      iptValidation.channelNameHasError = true;
      iptValidation.channelNameErrorMsg = this.props.localeStrings.selectTemplateRequired;

      this.setState({
        iptValidation: iptValidation,
      });
    } else if (!channelName || channelName.length === 0) {
      iptValidation.channelNameHasError = true;
      iptValidation.channelNameErrorMsg = this.props.localeStrings.channelNameRequired;

      this.setState({
        iptValidation: iptValidation,
      });
    } else {
      let existItem = channelList.filter((item: IChannelInfo) => item.name === channelName);

      if (existItem.length > 0) {
        iptValidation.channelNameHasError = true;
        iptValidation.channelNameErrorMsg = this.props.localeStrings.duplicateName;

        this.setState({
          iptValidation: iptValidation,
        });
      } else {
        let item = getInitChannelItem();
        item.name = channelName;
        channelList.push(item);
        let selTemplateItem = this.state.selTemplateItem;
        selTemplateItem.setting = channelList;
        let templateList = this.state.templateList.map((item, i) => {
          if (item.title === selTemplateItem.title) {
            item.setting = channelList;
            if (!item.isAdd) {
              item.isEdit = true;
            }
          }
          return item;
        });

        this.setState({
          iptValidation: iptValidation,
          iptChannelName: "",
          selTemplateItem: selTemplateItem,
          templateList: templateList,
        });
      }
    }
  };

  private onEditChannel = (index: number) => {
    let selChannel = this.state.selTemplateItem.setting[index];

    this.setState({
      selChannelItem: selChannel,
      showChannelSetting: true,
    });
  };

  private onDelChannel = (index: number) => {
    let channelList = this.state.selTemplateItem.setting;
    let delItem = channelList[index];

    let templateList = this.state.templateList.map((item, i) => {
      if (item.title === this.state.selTemplateItem.title) {
        item.setting = channelList.filter((item: IChannelInfo) => item.name !== delItem.name);
        if (!item.isAdd) {
          item.isEdit = true;
        }
      }
      return item;
    });

    this.setState({
      templateList: templateList,
    });
  };

  private onChannelSettingSave = (channelInfo: IChannelInfo) => {
    let templateList = this.state.templateList;
    let selTemplate = this.state.selTemplateItem;

    let cIndex = selTemplate.setting.findIndex(
      (item) => item.name === this.state.selChannelItem.name
    );
    selTemplate.setting[cIndex] = channelInfo;
    if (!selTemplate.isAdd) {
      selTemplate.isEdit = true;
    }

    let tIndex = templateList.findIndex((item) => item.title === selTemplate.title);
    templateList[tIndex] = selTemplate;

    this.setState({
      templateList: templateList,
      showChannelSetting: false,
    });
  };

  private onGoBack = () => {
    this.setState({
      showChannelSetting: false,
      selChannelItem: getInitChannelItem(),
    });
  };

  // update the incident in incident transaction list
  private onUpdateTemplate = async () => {
    console.log(constants.infoLogPrefix + JSON.stringify(this.state.templateList));
    this.scrollToTop();
    this.props.hideMessageBar();

    this.setState({
      loaderMessage: this.props.localeStrings.channelTemplateSaveLoaderMessage,
    });

    try {
      let delList = this.state.templateList.filter((item: ITemplateInfo) => item.isDel === true);
      let hasDelErr = await this.delTemplate(delList);

      let addList = this.state.templateList.filter((item: ITemplateInfo) => item.isAdd === true);
      let hasAddErr = await this.addTemplate(addList);

      let editList = this.state.templateList.filter((item: ITemplateInfo) => item.isEdit === true);
      let hasEditErr = await this.editTemplate(editList);

      this.setState({
        showLoader: false,
        formOpacity: 1,
      });

      if (hasDelErr || hasAddErr || hasEditErr) {
        this.props.showMessageBar(
          this.props.localeStrings.genericErrorMessage +
            ", " +
            this.props.localeStrings.errMsgForChannelTemplate,
          constants.messageBarType.error
        );
      } else {
        this.props.showMessageBar(
          this.props.localeStrings.saveSuccessMessage,
          constants.messageBarType.success
        );
        this.props.onBackClick(true);
      }
    } catch (error) {
      console.error(
        constants.errorLogPrefix + "ChannelTemplate_onUpdateTemplate \n",
        JSON.stringify(error)
      );

      // Log Exception
      this.dataService.trackException(
        this.props.appInsights,
        error,
        constants.componentNames.ChannelTemplateComponent,
        "ChannelTemplate_onUpdateTemplate",
        this.props.userPrincipalName
      );

      this.setState({
        showLoader: false,
        formOpacity: 1,
      });

      this.props.showMessageBar(
        this.props.localeStrings.genericErrorMessage +
          ", " +
          this.props.localeStrings.errMsgForChannelTemplate,
        constants.messageBarType.error
      );
    }
  };

  private addTemplate = async (templateList: ITemplateInfo[]): Promise<boolean> => {
    let hasErr = false;

    if (templateList && templateList.length > 0) {
      this.graphEndpoint = `${graphConfig.spSiteGraphEndpoint}${this.props.siteId}${graphConfig.listsGraphEndpoint}/${siteConfig.channelTemplateList}/items`;

      await templateList.forEach(async (item, i) => {
        try {
          let addObj = {
            fields: {
              Title: item.title,
              Setting: JSON.stringify(item.setting),
            },
          };

          const added = await this.dataService.sendGraphPostRequest(
            this.graphEndpoint,
            this.props.graph,
            addObj
          );

          // check if is added
          if (added) {
            console.log(constants.infoLogPrefix + "Template added: " + item.title);
          } else {
            hasErr = true;
            //log trace
            this.dataService.trackTrace(
              this.props.appInsights,
              "Add template Failed: " + item.title,
              "", // incidentAdded.id,
              this.props.userPrincipalName
            );
          }
        } catch (error) {
          hasErr = true;
          console.error(
            constants.errorLogPrefix + "ChannelTemplate_addTemplate error \n",
            JSON.stringify(error)
          );
        }
      });
    }

    return hasErr;
  };

  private editTemplate = async (templateList: ITemplateInfo[]): Promise<boolean> => {
    let hasErr = false;

    if (templateList && templateList.length > 0) {
      this.graphEndpoint = `${graphConfig.spSiteGraphEndpoint}${this.props.siteId}${graphConfig.listsGraphEndpoint}/${siteConfig.channelTemplateList}/items`;

      await templateList.forEach(async (item, i) => {
        try {
          let editEndpoint = `${this.graphEndpoint}/${item.itemId}`;

          let editObj = {
            fields: {
              // Title: item.title,
              Setting: JSON.stringify(item.setting),
            },
          };

          const edited = await this.dataService.sendGraphPatchRequest(
            editEndpoint,
            this.props.graph,
            editObj
          );

          // check if is edited
          if (edited) {
            console.log(constants.infoLogPrefix + "Template edited: " + item.title);
          } else {
            hasErr = true;
            //log trace
            this.dataService.trackTrace(
              this.props.appInsights,
              "Edit template Failed: " + item.title,
              "", // incidentAdded.id,
              this.props.userPrincipalName
            );
          }
        } catch (error) {
          hasErr = true;
          console.error(
            constants.errorLogPrefix + "ChannelTemplate_editTemplate error \n",
            JSON.stringify(error)
          );
        }
      });
    }

    return hasErr;
  };

  private delTemplate = async (templateList: ITemplateInfo[]): Promise<boolean> => {
    let hasErr = false;

    if (templateList && templateList.length > 0) {
      this.graphEndpoint = `${graphConfig.spSiteGraphEndpoint}${this.props.siteId}${graphConfig.listsGraphEndpoint}/${siteConfig.channelTemplateList}/items`;

      await templateList.forEach(async (item, i) => {
        try {
          let delEndpoint = `${this.graphEndpoint}/${item.itemId}`;

          const deled = await this.dataService.sendGraphDeleteRequest(
            delEndpoint,
            this.props.graph
          );

          // check if is deled
          if (deled) {
            console.log(constants.infoLogPrefix + "Template deleted: " + item.title);
          } else {
            hasErr = true;
            //log trace
            this.dataService.trackTrace(
              this.props.appInsights,
              "Delete template Failed: " + item.title,
              "", // incidentAdded.id,
              this.props.userPrincipalName
            );
          }
        } catch (error) {
          hasErr = true;
          console.error(
            constants.errorLogPrefix + "ChannelTemplate_delTemplate error \n",
            JSON.stringify(error)
          );
        }
      });
    }

    return hasErr;
  };

  // method to delay the operation by adding timeout
  private timeout = (delay: number): Promise<any> => {
    return new Promise((res) => setTimeout(res, delay));
  };

  // move focus to top of page to show loader or message bar
  private scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  //main render method
  public render() {
    return (
      <>
        {!this.state.showChannelSetting && (
          <div className="incident-details">
            {this.state.showLoader && (
              <div className="loader-bg">
                <div className="loaderStyle">
                  <Loader label={this.state.loaderMessage} size="largest" />
                </div>
              </div>
            )}
            <div style={{ opacity: this.state.formOpacity }}>
              <div className="col-xs-12 col-sm-8 col-md-4 container" id="incident-details-path">
                <label>
                  <span onClick={() => this.props.onBackClick(false)} className="go-back">
                    <ChevronStartIcon id="path-back-icon" />
                    <span className="back-label" title="Back">
                      {this.props.localeStrings.back}
                    </span>
                  </span>{" "}
                  &nbsp;&nbsp;
                  <span className="right-border">|</span>
                  <span>
                    &nbsp;&nbsp;
                    {this.props.localeStrings.channelTemplateFormTitle}
                  </span>
                </label>
              </div>
              <div className="incident-details-form-area">
                <div className="container">
                  <div className="incident-form-head-text">
                    {this.props.localeStrings.channelTemplateFormTitle}
                  </div>
                  <Row>
                    <Col xs={12} lg={6}>
                      <Row>
                        <Col xs={12}>
                          <div>
                            <label className="FormInput-label FormInput-label-fix">
                              {this.props.localeStrings.fieldTemplateName}
                            </label>
                            <Row>
                              <Col xs={8}>
                                <FormInput
                                  type="text"
                                  placeholder={this.props.localeStrings.phTemplateName}
                                  fluid={true}
                                  maxLength={constants.maxCharLengthForTemplateName}
                                  required
                                  onChange={(evt) => this.onTextInputChange(evt, "templateName")}
                                  value={this.state.iptTemplateName}
                                  className="incident-details-input-field"
                                  successIndicator={false}
                                />
                              </Col>
                              <Col xs={4}>
                                <Button
                                  style={{ marginTop: "5px" }}
                                  primary
                                  onClick={this.onAddTemplate}
                                  fluid={true}
                                  title={this.props.localeStrings.btnAdd}
                                >
                                  <label>{this.props.localeStrings.btnAdd}</label>
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                        {this.state.iptValidation.templateNameHasError &&
                          this.state.iptValidation.templateNameErrorMsg.length === 0 && (
                            <Col xs={12}>
                              <label className="message-label">
                                {this.props.localeStrings.templateNameRequired}
                              </label>
                            </Col>
                          )}
                        {this.state.iptValidation.templateNameHasError &&
                          this.state.iptValidation.templateNameErrorMsg.length > 0 && (
                            <Col xs={12}>
                              <label className="message-label">
                                {this.state.iptValidation.templateNameErrorMsg}
                              </label>
                            </Col>
                          )}
                        <Col xs={12}>
                          <div className="role-assignment-table">
                            <Row id="role-grid-thead">
                              <Col xs={2}>{this.props.localeStrings.headerSelected}</Col>
                              <Col xs={8} className="thead-border-left">
                                {this.props.localeStrings.headerTemplateName}
                              </Col>
                              <Col xs={2} className="thead-border-left col-center">
                                {this.props.localeStrings.headerDelete}
                              </Col>
                            </Row>
                            {this.state.templateList.map(
                              (item, index) =>
                                !item.isDel && (
                                  <Row key={index} id="role-grid-tbody">
                                    <Col xs={2}>
                                      <input
                                        type="radio"
                                        onChange={(e) => this.onSelTemplate(index)}
                                        checked={
                                          this.state.selTemplateItem.title
                                            ? this.state.selTemplateItem.title === item.title
                                            : false
                                        }
                                      />
                                    </Col>
                                    <Col xs={8}>{item.title}</Col>
                                    <Col xs={2} className="col-center">
                                      <img
                                        src={require("../assets/Images/DeleteIcon.svg").default}
                                        alt="Delete Icon"
                                        className="role-icon"
                                        onClick={(e) => this.onDelTemplate(index)}
                                        title={this.props.localeStrings.headerDelete}
                                      />
                                    </Col>
                                  </Row>
                                )
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={12} lg={6}>
                      <Row>
                        <Col xs={12}>
                          <div>
                            <label className="FormInput-label FormInput-label-fix">
                              {this.props.localeStrings.fieldChannelName}
                            </label>
                            <Row>
                              <Col xs={8}>
                                <FormInput
                                  type="text"
                                  placeholder={this.props.localeStrings.phChannelName}
                                  fluid={true}
                                  maxLength={constants.maxCharLengthForChannelName}
                                  required
                                  onChange={(evt) => this.onTextInputChange(evt, "channelName")}
                                  value={this.state.iptChannelName}
                                  className="incident-details-input-field"
                                  successIndicator={false}
                                />
                              </Col>
                              <Col xs={4}>
                                <Button
                                  style={{ marginTop: "5px" }}
                                  primary
                                  fluid={true}
                                  title={this.props.localeStrings.btnAdd}
                                  onClick={this.onAddChannel}
                                >
                                  <label>{this.props.localeStrings.btnAdd}</label>
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                        {this.state.iptValidation.channelNameHasError &&
                          this.state.iptValidation.channelNameErrorMsg.length === 0 && (
                            <Col xs={12}>
                              <label className="message-label">
                                {this.props.localeStrings.channelNameRequired}
                              </label>
                            </Col>
                          )}
                        {this.state.iptValidation.channelNameHasError &&
                          this.state.iptValidation.channelNameErrorMsg.length > 0 && (
                            <Col xs={12}>
                              <label className="message-label">
                                {this.state.iptValidation.channelNameErrorMsg}
                              </label>
                            </Col>
                          )}
                        <Col xs={12}>
                          <div className="role-assignment-table">
                            <Row id="role-grid-thead">
                              <Col xs={8}>{this.props.localeStrings.headerChannelName}</Col>
                              <Col xs={2} className="thead-border-left col-center">
                                {this.props.localeStrings.headerDelete}
                              </Col>
                              <Col xs={2} className="thead-border-left col-center">
                                {this.props.localeStrings.headerSetting}
                              </Col>
                            </Row>
                            {this.state.selTemplateItem.setting.map((item, index) => (
                              <Row key={index} id="role-grid-tbody">
                                <Col xs={8}>{item.name}</Col>
                                <Col xs={2} className="col-center">
                                  <img
                                    src={require("../assets/Images/DeleteIcon.svg").default}
                                    alt="Delete Icon"
                                    className="role-icon"
                                    onClick={(e) => this.onDelChannel(index)}
                                    title={this.props.localeStrings.headerDelete}
                                  />
                                </Col>
                                <Col xs={2} className="col-center">
                                  <img
                                    src={require("../assets/Images/GridEditIcon.svg").default}
                                    alt="Edit Icon"
                                    className="role-icon"
                                    onClick={(e) => this.onEditChannel(index)}
                                    title={this.props.localeStrings.headerEdit}
                                  />
                                </Col>
                              </Row>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col xs={12}>
                      <div className="new-incident-btn-area">
                        <Flex hAlign="end" gap="gap.large" wrap={true}>
                          <Button
                            onClick={() => this.props.onBackClick(false)}
                            id="new-incident-back-btn"
                            fluid={true}
                            title={this.props.localeStrings.btnBack}
                          >
                            <ChevronStartIcon /> &nbsp;
                            <label>{this.props.localeStrings.btnBack}</label>
                          </Button>
                          <Button
                            primary
                            onClick={() => this.onUpdateTemplate()}
                            fluid={true}
                            id="new-incident-create-btn"
                            title={this.props.localeStrings.btnUpdateChannelTemplate}
                          >
                            <img
                              src={require("../assets/Images/ButtonEditIcon.svg").default}
                              alt="edit icon"
                            />{" "}
                            &nbsp;
                            <label>{this.props.localeStrings.btnUpdateChannelTemplate}</label>
                          </Button>
                        </Flex>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </div>
        )}
        {this.state.showChannelSetting && (
          <ChannelSetting
            selChannel={this.state.selChannelItem}
            onSave={this.onChannelSettingSave}
            onGoBack={this.onGoBack}
            localeStrings={this.props.localeStrings}
          />
        )}
      </>
    );
  }
}

export default ChannelTemplate;
