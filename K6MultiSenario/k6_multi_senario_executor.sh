#!/bin/bash

k6 run -e TOKEN_USERNAME='ossisgreat1526@example.com' -e TOKEN_PASSWORD='superCroc2019' -e TEST_TO_RUN='smoke' -e ENV_2_RUN='test' k6_multi_scenario_template.js
