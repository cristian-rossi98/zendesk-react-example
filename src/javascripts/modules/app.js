/**
 *  Example app
 **/
import React from "react";
import { render } from "react-dom";
import { ThemeProvider, DEFAULT_THEME } from "@zendeskgarden/react-theming";
import { Grid, Row, Col } from "@zendeskgarden/react-grid";
import { OrderedList, UnorderedList } from "@zendeskgarden/react-typography";
import I18n from "../../javascripts/lib/i18n";
import {
  resizeContainer,
  escapeSpecialChars as escape,
} from "../../javascripts/lib/helpers";

const MAX_HEIGHT = 1000;
const API_ENDPOINTS = {
  organizations: "/api/v2/organizations.json",
  tickets: "/api/v2/tickets",
};

class App {
  constructor(client, _appData) {
    this._client = client;

    // this.initializePromise is only used in testing
    // indicate app initilization(including all async operations) is complete
    this.initializePromise = this.init();
  }

  /**
   * Initialize module, render main template
   */
  async init() {
    const currentUser = (await this._client.get("currentUser")).currentUser;

    I18n.loadTranslations(currentUser.locale);

    const organizationsResponse = await this._client
      .request(API_ENDPOINTS.organizations)
      .catch(this._handleError.bind(this));

    const organizations = organizationsResponse
      ? organizationsResponse.organizations
      : [];

    const appContainer = document.querySelector(".main");

    let newTicket = {
      ticket: {
        comment: {
          body: "Ticket criado via React App",
        },
        priority: "urgent",
        subject: "Meu primeiro ticket via React",
      },
    };

    // const createTicket = await this._client
    //   .request({
    //     url: API_ENDPOINTS.tickets,
    //     type: "POST",
    //     contentType: "application/json",
    //     data: JSON.stringify(newTicket),
    //   })
    //   .catch(this._handleError.bind(this));

    const listTickets = await this._client
      .request({
        url: API_ENDPOINTS.tickets,
        type: "GET",
        contentType: "application/json",
      })
      .catch(this._handleError.bind(this));

    // console.log("NEW TICKET: ", createTicket);
    console.log("TICKETS: ", listTickets.tickets);

    render(
      <ThemeProvider theme={{ ...DEFAULT_THEME }}>
        <Grid>
          <Row>
            <Col data-test-id="sample-app-description">
              Hi {escape(currentUser.name)}, this is a sample app
            </Col>
          </Row>
          <Row>
            <Col>
              <span>{I18n.t("default.organizations")}:</span>
              <UnorderedList data-test-id="organizations">
                {organizations.map((organization) => (
                  <UnorderedList.Item
                    key={`organization-${organization.id}`}
                    data-test-id={`organization-${organization.id}`}
                  >
                    {escape(organization.name)}
                  </UnorderedList.Item>
                ))}
              </UnorderedList>
            </Col>
          </Row>
          <Row>
            <Col data-test-id="tickets">
              <span>Tickets</span>
              <UnorderedList data-test-id="organizations">
                {listTickets.tickets.map((ticket) => (
                  <UnorderedList.Item key={ticket.id}>
                    {ticket.subject}
                  </UnorderedList.Item>
                ))}
              </UnorderedList>
            </Col>
          </Row>
        </Grid>
      </ThemeProvider>,
      appContainer
    );
    return resizeContainer(this._client, MAX_HEIGHT);
  }

  /**
   * Handle error
   * @param {Object} error error object
   */
  _handleError(error) {
    console.log("An error is handled here: ", error.message);
  }
}

export default App;
