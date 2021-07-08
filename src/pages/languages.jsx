import React, { useEffect, useState } from 'react'
import styled from "styled-components"
import JSONData from "../../data.json"

import DonutComponent from "../components/DonutChart/DonutComponent"
import { StringParam, useQueryParam } from "use-query-params"

import Layout from "../global/Layout"
import { Page } from "./index"

const Header = styled.h1`
  font-size: 5vw;
  margin-bottom: 4vw;
`


const Languages = () => {
    const [data, setData] = useState(null)
    const [queryRepo, _] = useQueryParam("repo", StringParam)

    useEffect(() => {
        if (JSONData) {
            setData(JSONData.data[0].repos.filter((repo) => repo.name.toLowerCase() === queryRepo))
        }
    }, [])

    return (
        <Layout>
            <Page>
                {data ? (
                    <>
                        <Header>{queryRepo}</Header>
                        <svg viewBox="-2 0 100 100" preserveAspectRatio="xMidYMid meet">
                            <DonutComponent x={45} y={20} data={data[0]} />
                        </svg>
                    </>
                ) : (<p>Loading</p>)
                }
            </Page>
        </Layout>
    )
}

export default Languages