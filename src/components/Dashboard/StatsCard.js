import React from "react";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardTitle,
  CardText,
  Row,
  Col
} from "reactstrap";

const StatsCard = ({ text , value , percentage , textColor,icon }) => {

    return (
        <>
          <Col style={{ width: "18rem" }}>
            <Card className="card-stats mb-5 mb-lg-0">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle className="text-uppercase text-muted mb-0">
                      {text}
                    </CardTitle>
                    <span className={ "h2 font-weight-bold mb-0 text-" + textColor }>{value} {percentage ? "%" : " "}</span>
                  </div>
                  <Col className="col-auto">
                    <div className={"icon icon-shape bg-"+textColor+" text-white rounded-circle shadow"}>
                      <i className={icon}></i>
                    </div>
                  </Col>
                </Row>
                {/*<p className="mt-3 mb-0 text-muted text-sm">
                  <span className="text-success mr-2">
                    <i className="fa fa-arrow-up" />
                    3.48%
                  </span>
                  <span className="text-nowrap">Since last month</span>
                </p>*/}
              </CardBody>
            </Card>
          </Col>
        </>
    );
}

export default StatsCard;