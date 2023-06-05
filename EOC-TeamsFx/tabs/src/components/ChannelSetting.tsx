import React from "react";
import { Button, ChevronStartIcon, Flex, FormInput, Loader } from "@fluentui/react-northstar";
import { Checkbox } from "@fluentui/react/lib/Checkbox";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "bootstrap/dist/css/bootstrap.min.css";
import "../scss/ChannelSetting.module.scss";
import * as constants from "../common/Constants";
import { IChannelInfo, ICusAppTabInfo, IWebTabInfo } from "./ChannelTemplate";

interface IChannelSettingProps {
  selChannel: IChannelInfo;
  onSave(channelInfo: IChannelInfo): void;
  onGoBack(): void;
  localeStrings: any;
}

interface IChannelSettingState {
  channelInfo: IChannelInfo;
  showLoader: boolean;
  loaderMessage: string;
  formOpacity: number;
  webTabList: IWebTabInfo[];
  cusAppList: ICusAppTabInfo[];
  chkNewsTab: boolean;
  chkAssessmentTab: boolean;
  chkPlannerTab: boolean;
  iptWebName: string;
  iptWebUrl: string;
  iptCusAppName: string;
  iptCusAppId: string;
  iptCusAppContentUrl: string;
  webTabHasErr: boolean;
  webTabErrMsg: string;
  cusAppHasErr: boolean;
  cusAppErrMsg: string;
}

class ChannelSetting extends React.PureComponent<IChannelSettingProps, IChannelSettingState> {
  constructor(props: IChannelSettingProps) {
    super(props);

    this.state = {
      channelInfo: this.props.selChannel,
      showLoader: false,
      loaderMessage: this.props.localeStrings.genericLoaderMessage,
      formOpacity: 1,
      webTabList: this.props.selChannel.webTabList,
      cusAppList: this.props.selChannel.cusAppList,
      chkNewsTab: this.props.selChannel.newsTab,
      chkAssessmentTab: this.props.selChannel.assessmentTab,
      chkPlannerTab: this.props.selChannel.plannerTab,
      iptWebName: "",
      iptWebUrl: "",
      iptCusAppName: "",
      iptCusAppId: "",
      iptCusAppContentUrl: "",
      webTabHasErr: false,
      webTabErrMsg: "",
      cusAppHasErr: false,
      cusAppErrMsg: "",
    };

    this.onTextInputChange = this.onTextInputChange.bind(this);
    this.onAddWebTab = this.onAddWebTab.bind(this);
    this.onDelWebTab = this.onDelWebTab.bind(this);
    this.onAddCusApp = this.onAddCusApp.bind(this);
    this.onDelCusApp = this.onDelCusApp.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  private onTextInputChange = (event: any, key: string) => {
    let iptValue = event.target.value ? event.target.value : "";

    switch (key) {
      case "webName":
        this.setState({
          iptWebName: iptValue.trim(),
        });
        break;
      case "webUrl":
        this.setState({
          iptWebUrl: iptValue.trim(),
        });
        break;
      case "cusAppName":
        this.setState({
          iptCusAppName: iptValue.trim(),
        });
        break;
      case "cusAppId":
        this.setState({
          iptCusAppId: iptValue.trim(),
        });
        break;
      case "cusAppContentUrl":
        this.setState({
          iptCusAppContentUrl: iptValue.trim(),
        });
        break;
      default:
        break;
    }
  };

  private onAddWebTab = () => {
    if (this.state.webTabList.length === constants.maxWebTabCount) {
      this.setState({
        webTabHasErr: true,
        webTabErrMsg: this.props.localeStrings.webTabListLimit,
      });
    } else if (this.state.iptWebName.length === 0 || this.state.iptWebUrl.length === 0) {
      this.setState({
        webTabHasErr: true,
        webTabErrMsg: this.props.localeStrings.webTabNameRequired,
      });
    } else {
      let nIndex = this.state.webTabList.findIndex((item) => item.name === this.state.iptWebName);
      let uIndex = this.state.webTabList.findIndex((item) => item.url === this.state.iptWebUrl);
      if (nIndex > -1) {
        this.setState({
          webTabHasErr: true,
          webTabErrMsg: this.props.localeStrings.duplicateName,
        });
      } else if (uIndex > -1) {
        this.setState({
          webTabHasErr: true,
          webTabErrMsg: this.props.localeStrings.duplicateUrl,
        });
      } else {
        let webTabList = this.state.webTabList;
        let webTab: IWebTabInfo = {
          name: this.state.iptWebName,
          url: this.state.iptWebUrl,
        };
        webTabList.push(webTab);
        this.setState({
          webTabList: webTabList,
          webTabHasErr: false,
          iptWebName: "",
          iptWebUrl: "",
        });
      }
    }
  };

  private onDelWebTab = (index: number) => {
    let delItem = this.state.webTabList[index];
    let webTabList = this.state.webTabList.filter(
      (item: IWebTabInfo) => item.name !== delItem.name
    );
    this.setState({
      webTabList: webTabList,
    });
  };

  private onAddCusApp = () => {
    if (this.state.cusAppList.length === constants.maxCusAppCount) {
      this.setState({
        cusAppHasErr: true,
        cusAppErrMsg: this.props.localeStrings.cusAppListLimit,
      });
    } else if (
      this.state.iptCusAppName.length === 0 ||
      this.state.iptCusAppId.length === 0 ||
      this.state.iptCusAppContentUrl.length === 0
    ) {
      this.setState({
        cusAppHasErr: true,
        cusAppErrMsg: this.props.localeStrings.cusAppNameRequired,
      });
    } else {
      let nIndex = this.state.cusAppList.findIndex(
        (item) => item.name === this.state.iptCusAppName
      );
      let iIndex = this.state.cusAppList.findIndex((item) => item.appId === this.state.iptCusAppId);
      if (nIndex > -1) {
        this.setState({
          cusAppHasErr: true,
          cusAppErrMsg: this.props.localeStrings.duplicateName,
        });
      } else if (iIndex > -1) {
        this.setState({
          cusAppHasErr: true,
          cusAppErrMsg: this.props.localeStrings.duplicateAppId,
        });
      } else {
        let cusAppList = this.state.cusAppList;
        let cusApp: ICusAppTabInfo = {
          name: this.state.iptCusAppName,
          appId: this.state.iptCusAppId,
          contentUrl: this.state.iptCusAppContentUrl,
        };
        cusAppList.push(cusApp);
        this.setState({
          cusAppList: cusAppList,
          cusAppHasErr: false,
          iptCusAppName: "",
          iptCusAppId: "",
          iptCusAppContentUrl: "",
        });
      }
    }
  };

  private onDelCusApp = (index: number) => {
    let delItem = this.state.cusAppList[index];
    let cusAppList = this.state.cusAppList.filter(
      (item: ICusAppTabInfo) => item.name !== delItem.name
    );
    this.setState({
      cusAppList: cusAppList,
    });
  };

  private onSave = () => {
    let channelInfo = this.state.channelInfo;
    channelInfo.plannerTab = this.state.chkPlannerTab;
    channelInfo.newsTab = this.state.chkNewsTab;
    channelInfo.assessmentTab = this.state.chkAssessmentTab;
    channelInfo.webTabList = this.state.webTabList;
    channelInfo.cusAppList = this.state.cusAppList;
    this.props.onSave(channelInfo);
  };

  render() {
    return (
      <>
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
                <span onClick={() => this.props.onGoBack()} className="go-back">
                  <ChevronStartIcon id="path-back-icon" />
                  <span className="back-label" title="Back">
                    {this.props.localeStrings.back}
                  </span>
                </span>{" "}
                &nbsp;&nbsp;
                <span className="right-border">|</span>
                <span>
                  &nbsp;&nbsp;
                  {this.props.localeStrings.channelSettingFormTitle}
                </span>
              </label>
            </div>
            <div className="incident-details-form-area">
              <div className="container">
                <div className="incident-form-head-text">
                  {`${this.props.localeStrings.channelSettingFormTitle} : ${this.props.selChannel.name}`}
                </div>
                <Row>
                  <Col xs={4} md={3} lg={2}>
                    <Checkbox
                      className="role-checkbox"
                      label="Planner Tab"
                      checked={this.state.chkPlannerTab}
                      onChange={(ev, isChecked) =>
                        this.setState({
                          chkPlannerTab: isChecked ? isChecked : false,
                        })
                      }
                    />
                  </Col>
                  <Col xs={4} md={3} lg={2}>
                    <Checkbox
                      className="role-checkbox"
                      label="News Tab"
                      checked={this.state.chkNewsTab}
                      onChange={(ev, isChecked) =>
                        this.setState({
                          chkNewsTab: isChecked ? isChecked : false,
                        })
                      }
                    />
                  </Col>
                  <Col xs={4} md={3} lg={2}>
                    <Checkbox
                      className="role-checkbox"
                      label="Assessment Tab"
                      checked={this.state.chkAssessmentTab}
                      onChange={(ev, isChecked) =>
                        this.setState({
                          chkAssessmentTab: isChecked ? isChecked : false,
                        })
                      }
                    />
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col xs={6} lg={5}>
                    <div>
                      <label className="FormInput-label">
                        {this.props.localeStrings.channelWebName}
                      </label>
                      <Row>
                        <Col xs={12}>
                          <FormInput
                            type="text"
                            placeholder={this.props.localeStrings.phWebName}
                            fluid={true}
                            maxLength={constants.maxCharLengthForWebName}
                            onChange={(evt) => this.onTextInputChange(evt, "webName")}
                            value={this.state.iptWebName}
                            className="incident-details-input-field"
                            successIndicator={false}
                          />
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col xs={9} lg={10}>
                    <div style={{ marginTop: "5px" }}>
                      <label className="FormInput-label">
                        {this.props.localeStrings.channelWebUrl}
                      </label>
                      <Row>
                        <Col xs={12}>
                          <FormInput
                            type="text"
                            placeholder={this.props.localeStrings.phWebUrl}
                            fluid={true}
                            onChange={(evt) => this.onTextInputChange(evt, "webUrl")}
                            value={this.state.iptWebUrl}
                            className="incident-details-input-field"
                            successIndicator={false}
                          />
                          {this.state.webTabHasErr && (
                            <label className="message-label">{this.state.webTabErrMsg}</label>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col xs={3} lg={2}>
                    <Button
                      style={{ marginTop: "30px" }}
                      primary
                      onClick={this.onAddWebTab}
                      fluid={true}
                      title={this.props.localeStrings.btnAdd}
                    >
                      <label>{this.props.localeStrings.btnAdd}</label>
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <div className="role-assignment-table">
                      <Row id="role-grid-thead">
                        <Col xs={4}>{this.props.localeStrings.channelWebName}</Col>
                        <Col xs={6} className="thead-border-left">
                          {this.props.localeStrings.channelWebUrl}
                        </Col>
                        <Col xs={2} className="thead-border-left col-center">
                          {this.props.localeStrings.headerDelete}
                        </Col>
                      </Row>
                      {this.state.webTabList.map((item, index) => (
                        <Row key={index} id="role-grid-tbody">
                          <Col xs={4}>{item.name}</Col>
                          <Col xs={6}>{item.url}</Col>
                          <Col xs={2} className="col-center">
                            <img
                              src={require("../assets/Images/DeleteIcon.svg").default}
                              alt="Delete Icon"
                              className="role-icon"
                              onClick={(e) => this.onDelWebTab(index)}
                              title={this.props.localeStrings.headerDelete}
                            />
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col xs={6} lg={5}>
                    <div>
                      <label className="FormInput-label">
                        {this.props.localeStrings.channelCusAppName}
                      </label>
                      <Row>
                        <Col xs={12}>
                          <FormInput
                            type="text"
                            placeholder={this.props.localeStrings.phCusAppName}
                            fluid={true}
                            maxLength={constants.maxCharLengthForCusAppName}
                            onChange={(evt) => this.onTextInputChange(evt, "cusAppName")}
                            value={this.state.iptCusAppName}
                            className="incident-details-input-field"
                            successIndicator={false}
                          />
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col xs={9} lg={10}>
                    <div style={{ marginTop: "5px" }}>
                      <label className="FormInput-label">
                        {this.props.localeStrings.channelCusAppId}
                      </label>
                      <Row>
                        <Col xs={12}>
                          <FormInput
                            type="text"
                            placeholder={this.props.localeStrings.phCusAppId}
                            fluid={true}
                            onChange={(evt) => this.onTextInputChange(evt, "cusAppId")}
                            value={this.state.iptCusAppId}
                            className="incident-details-input-field"
                            successIndicator={false}
                          />
                          {this.state.cusAppHasErr && (
                            <label className="message-label">{this.state.cusAppErrMsg}</label>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col xs={9} lg={10}>
                    <div style={{ marginTop: "5px" }}>
                      <label className="FormInput-label">
                        {this.props.localeStrings.channelCusAppContentUrl}
                      </label>
                      <Row>
                        <Col xs={12}>
                          <FormInput
                            type="text"
                            placeholder={this.props.localeStrings.phCusAppContentUrl}
                            fluid={true}
                            onChange={(evt) => this.onTextInputChange(evt, "cusAppContentUrl")}
                            value={this.state.iptCusAppContentUrl}
                            className="incident-details-input-field"
                            successIndicator={false}
                          />
                          {this.state.cusAppHasErr && (
                            <label className="message-label">{this.state.cusAppErrMsg}</label>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col xs={3} lg={2}>
                    <Button
                      style={{ marginTop: "30px" }}
                      primary
                      onClick={this.onAddCusApp}
                      fluid={true}
                      title={this.props.localeStrings.btnAdd}
                    >
                      <label>{this.props.localeStrings.btnAdd}</label>
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <div className="role-assignment-table">
                      <Row id="role-grid-thead">
                        <Col xs={3}>{this.props.localeStrings.channelCusAppName}</Col>
                        <Col xs={4} className="thead-border-left">
                          {this.props.localeStrings.channelCusAppId}
                        </Col>
                        <Col xs={3} className="thead-border-left">
                          {this.props.localeStrings.channelCusAppContentUrl}
                        </Col>
                        <Col xs={2} className="thead-border-left col-center">
                          {this.props.localeStrings.headerDelete}
                        </Col>
                      </Row>
                      {this.state.cusAppList.map((item, index) => (
                        <Row key={index} id="role-grid-tbody">
                          <Col xs={3}>{item.name}</Col>
                          <Col xs={4}>{item.appId}</Col>
                          <Col xs={3}>{item.contentUrl}</Col>
                          <Col xs={2} className="col-center">
                            <img
                              src={require("../assets/Images/DeleteIcon.svg").default}
                              alt="Delete Icon"
                              className="role-icon"
                              onClick={(e) => this.onDelCusApp(index)}
                              title={this.props.localeStrings.headerDelete}
                            />
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col xs={12}>
                    <div className="new-incident-btn-area">
                      <Flex hAlign="end" gap="gap.large" wrap={true}>
                        <Button
                          onClick={() => this.props.onGoBack()}
                          id="new-incident-back-btn"
                          fluid={true}
                          title={this.props.localeStrings.btnBack}
                        >
                          <ChevronStartIcon /> &nbsp;
                          <label>{this.props.localeStrings.btnBack}</label>
                        </Button>
                        <Button
                          primary
                          onClick={() => this.onSave()}
                          fluid={true}
                          id="new-incident-create-btn"
                          title={this.props.localeStrings.btnUpdateChannelSetting}
                        >
                          <img
                            src={require("../assets/Images/ButtonEditIcon.svg").default}
                            alt="edit icon"
                          />{" "}
                          &nbsp;
                          <label>{this.props.localeStrings.btnUpdateChannelSetting}</label>
                        </Button>
                      </Flex>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ChannelSetting;
